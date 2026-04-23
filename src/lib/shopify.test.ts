import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import {
  storefrontApiRequest,
  createShopifyCart,
  addLineToShopifyCart,
  updateShopifyCartLine,
  removeLineFromShopifyCart,
  CART_QUERY,
} from "./shopify";
import type { ShopifyCartItem } from "./shopify";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const fetchMock = vi.fn();
global.fetch = fetchMock as unknown as typeof fetch;

const mockItem: ShopifyCartItem = {
  lineId: null,
  variantId: "variant-1",
  variantTitle: "Default",
  quantity: 2,
  price: { amount: "19.99", currencyCode: "USD" },
  selectedOptions: [{ name: "Size", value: "M" }],
  product: {
    node: {
      id: "product-1",
      title: "Test Product",
      description: "Desc",
      handle: "test-product",
      priceRange: { minVariantPrice: { amount: "19.99", currencyCode: "USD" } },
      images: { edges: [] },
      variants: { edges: [] },
      options: [],
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("storefrontApiRequest", () => {
  it("returns parsed response on success", async () => {
    const data = { data: { products: { edges: [] } } };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    });

    const result = await storefrontApiRequest("query Test { products { edges { node { id } } } }");

    expect(result).toEqual(data);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows a toast and returns undefined on 402 responses", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 402,
      json: vi.fn(),
    });

    const result = await storefrontApiRequest("query Test { products { edges { node { id } } } }");

    expect(result).toBeUndefined();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("throws for non-OK HTTP errors", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn(),
    });

    await expect(storefrontApiRequest("query")).rejects.toThrow("HTTP error! status: 500");
  });

  it("throws for GraphQL errors", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        errors: [{ message: "Something went wrong" }],
      }),
    });

    await expect(storefrontApiRequest("query")).rejects.toThrow("Shopify error: Something went wrong");
  });
});

describe("Shopify cart helpers", () => {
  it("creates a cart and normalizes checkout URL", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        data: {
          cartCreate: {
            userErrors: [],
            cart: {
              id: "cart-1",
              checkoutUrl: "https://shop.test/cart/c/123",
              lines: { edges: [{ node: { id: "line-1" } }] },
            },
          },
        },
      }),
    });

    const result = await createShopifyCart(mockItem);

    expect(result).toEqual({
      cartId: "cart-1",
      checkoutUrl: "https://shop.test/cart/c/123?channel=online_store",
      lineId: "line-1",
    });
  });

  it("returns null when cart creation has user errors", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        data: {
          cartCreate: {
            userErrors: [{ message: "Failed", field: null }],
            cart: null,
          },
        },
      }),
    });

    const result = await createShopifyCart(mockItem);
    expect(result).toBeNull();
  });

  it("marks cart as missing when add line returns cart-not-found errors", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        data: {
          cartLinesAdd: {
            userErrors: [{ message: "Cart does not exist", field: null }],
            cart: null,
          },
        },
      }),
    });

    await expect(addLineToShopifyCart("missing", mockItem)).resolves.toEqual({
      success: false,
      cartNotFound: true,
    });
  });

  it("returns line id when a new line is added", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        data: {
          cartLinesAdd: {
            userErrors: [],
            cart: {
              lines: {
                edges: [
                  { node: { id: "line-2", merchandise: { id: "variant-1" } } },
                  { node: { id: "line-3", merchandise: { id: "variant-2" } } },
                ],
              },
            },
          },
        },
      }),
    });

    await expect(addLineToShopifyCart("cart-1", mockItem)).resolves.toEqual({
      success: true,
      lineId: "line-2",
    });
  });

  it("returns success false when updating line has validation errors", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        data: {
          cartLinesUpdate: {
            userErrors: [{ message: "Quantity invalid", field: null }],
          },
        },
      }),
    });

    await expect(updateShopifyCartLine("cart-1", "line-1", 3)).resolves.toEqual({ success: false });
  });

  it("returns cart-not-found for update/remove operations when Shopify reports missing cart", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: {
            cartLinesUpdate: {
              userErrors: [{ message: "Cart not found", field: null }],
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: {
            cartLinesRemove: {
              userErrors: [{ message: "Cart does not exist", field: null }],
            },
          },
        }),
      });

    await expect(updateShopifyCartLine("missing", "line-1", 1)).resolves.toEqual({
      success: false,
      cartNotFound: true,
    });
    await expect(removeLineFromShopifyCart("missing", "line-1")).resolves.toEqual({
      success: false,
      cartNotFound: true,
    });
  });

  it("returns success true for successful remove and includes expected query usage", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: {
            cartLinesRemove: {
              userErrors: [],
              cart: { id: "cart-1" },
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: { cart: { id: "cart-1", totalQuantity: 1 } },
        }),
      });

    await expect(removeLineFromShopifyCart("cart-1", "line-1")).resolves.toEqual({
      success: true,
    });
    await storefrontApiRequest(CART_QUERY, { id: "cart-1" });

    const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(secondCallBody.query).toBe(CART_QUERY);
    expect(secondCallBody.variables).toEqual({ id: "cart-1" });
  });
});
