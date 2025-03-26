import { useProducts, usePayments, OnPurchaseResult, useOrders } from "@devvit/payments"
import { Devvit, useState } from "@devvit/public-api";
import { addUserPurchase, getUserPurchases } from "./utils/paymentUtils.js";

export function ProductsList({ context, purchases, setUserPurchases }: { context: any, purchases: any, setUserPurchases: (userPurchases: any) => void }) {
    const { products } = useProducts(context);
    const payments = usePayments(async (result: OnPurchaseResult) => {
        if(result.status === 1) {
            const userPurchases = await addUserPurchase(context, result.sku);
            setUserPurchases(userPurchases);
        }
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 3;

    // Calculate total pages
    const totalPages = products ? Math.ceil(products.length / itemsPerPage) : 0;

    // Get current page items
    const getCurrentPageItems = () => {
        if (!products) return [];
        const startIndex = currentPage * itemsPerPage;
        return products.slice(startIndex, startIndex + itemsPerPage);
    };

    // Navigation handlers
    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <vstack grow gap="medium" padding="small">
            <text size="large" weight="bold" color="#FFFFFF">Available Items</text>
            {products?.length === 0 ? (
                <text color="#FFFFFF" alignment="middle center">No products available.</text>
            ) : (
                <vstack gap="medium">
                    {getCurrentPageItems().map((product) => (
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
                            </vstack>
                            <vstack alignment="end">
                                {purchases?.purchases[product.sku] ? <button disabled appearance="bordered">
                                    Purchased!
                                </button> :  
                                <button
                                    icon="gold"
                                    appearance="primary"
                                    onPress={() => payments.purchase(product.sku)}
                                >
                                    Buy for {product.price}
                                </button> }

                            </vstack>
                        </hstack>
                    ))}

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <hstack gap="medium" alignment="middle center">
                            <button
                                onPress={goToPrevPage}
                                disabled={currentPage === 0}
                                appearance={currentPage === 0 ? undefined : "bordered"}
                            >
                                Previous
                            </button>
                            <text color="#FFFFFF">
                                Page {currentPage + 1} of {totalPages}
                            </text>
                            <button
                                onPress={goToNextPage}
                                disabled={currentPage === totalPages - 1}
                                appearance={currentPage === totalPages - 1 ? undefined : "bordered"}
                            >
                                Next
                            </button>
                        </hstack>
                    )}
                </vstack>
            )}
        </vstack>
    );
}