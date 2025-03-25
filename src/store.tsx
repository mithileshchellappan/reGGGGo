import { useProducts, usePayments, OnPurchaseResult } from "@devvit/payments"
import { Devvit } from "@devvit/public-api";

export function ProductsList({ context }: { context: any }) {
    const { products } = useProducts(context);
    const payments = usePayments((result: OnPurchaseResult) => { 
        console.log('Tried to buy:', result.sku, '; result:', result.status); 
    });

    return (
        <vstack grow gap="medium" padding="small">
            <text size="large" weight="bold" color="#FFFFFF">Available Items</text>
            {products?.length === 0 ? (
                <text color="#FFFFFF" alignment="middle center">No products available.</text>
            ) : (
                <vstack gap="medium">
                    {products?.map((product) => (
                        <hstack
                            key={product.sku}
                            gap="medium"
                            padding="small"
                            backgroundColor="rgba(255, 255, 255, 0.1)"
                            cornerRadius="medium"
                            alignment="middle"
                        >
                            {product.images?.icon ? (
                                <image
                                    url={product.images.icon}
                                    imageWidth={50}
                                    imageHeight={50}
                                />
                            ) : (
                                <vstack
                                    width={50}
                                    height={50}
                                    backgroundColor="rgba(255, 255, 255, 0.1)"
                                    cornerRadius="small"
                                    alignment="middle center"
                                >
                                    <text color="#FFFFFF">?</text>
                                </vstack>
                            )}
                            <vstack grow>
                                <text color="#FFFFFF" weight="bold">{product.displayName}</text>
                                <text color="#AAAAAA" size="small">{product.description || "No description"}</text>
                            </vstack>
                            <vstack alignment="end">
                                <button
                                    icon="gold"
                                    appearance="primary"
                                    onPress={() => payments.purchase(product.sku)}
                                >
                                    Use {product.price}
                                </button>
                            </vstack>
                        </hstack>
                    ))}
                </vstack>
            )}
        </vstack>
    );
}