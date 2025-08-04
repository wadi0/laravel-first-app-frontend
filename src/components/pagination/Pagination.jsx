import React from 'react';
import { Pagination } from '@mui/material';
import PropTypes from 'prop-types';
import './pagination.scss';

const CustomPagination = ({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 12,
    onPageChange,
    onItemsPerPageChange,
    loading = false,
    showInfo = true,
    showItemsPerPageSelector = true,
    itemsPerPageOptions = [6, 12, 24, 48],
    size = 'large',
    color = 'primary',
    showFirstButton = true,
    showLastButton = true,
    siblingCount = 2,
    boundaryCount = 1,
    className = '',
    disabled = false
}) => {
    // Calculate display information
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Handle pagination change
    const handlePageChange = (event, page) => {
        if (onPageChange && !loading && !disabled) {
            onPageChange(event, page);
        }
    };

    // Handle items per page change
    const handleItemsPerPageChange = (event) => {
        if (onItemsPerPageChange && !loading && !disabled) {
            onItemsPerPageChange(event);
        }
    };

    // Don't render if there's only one page and no items
    if (totalPages <= 1 && totalItems === 0) {
        return null;
    }

    return (
        <div className={`custom-pagination-wrapper ${className}`}>
            {/* Top Section: Info and Items per page selector */}
            {(showInfo || showItemsPerPageSelector) && (
                <div className="pagination-top-section">
                    {/* Results Info */}
                    {showInfo && (
                        <div className="pagination-info">
                            <span className="results-text">
                                {totalItems === 0
                                    ? 'No items found'
                                    : `Showing ${startItem}-${endItem} of ${totalItems} items`
                                }
                            </span>
                            {totalPages > 1 && (
                                <span className="page-text">
                                    (Page {currentPage} of {totalPages})
                                </span>
                            )}
                        </div>
                    )}

                    {/* Items per page selector */}
                    {showItemsPerPageSelector && totalItems > 0 && (
                        <div className="items-per-page-selector">
                            <label htmlFor="itemsPerPage" className="items-label">
                                Show:
                            </label>
                            <select
                                id="itemsPerPage"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                disabled={loading || disabled}
                                className="items-select"
                            >
                                {itemsPerPageOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option} per page
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* Main Pagination Component */}
            {totalPages > 1 && (
                <div className="pagination-main">
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color={color}
                        size={size}
                        showFirstButton={showFirstButton}
                        showLastButton={showLastButton}
                        siblingCount={siblingCount}
                        boundaryCount={boundaryCount}
                        disabled={loading || disabled}
                        className="mui-pagination"
                    />
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="pagination-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading...</span>
                </div>
            )}
        </div>
    );
};

CustomPagination.propTypes = {
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    totalItems: PropTypes.number,
    itemsPerPage: PropTypes.number,
    onPageChange: PropTypes.func.isRequired,
    onItemsPerPageChange: PropTypes.func,
    loading: PropTypes.bool,
    showInfo: PropTypes.bool,
    showItemsPerPageSelector: PropTypes.bool,
    itemsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    color: PropTypes.oneOf(['primary', 'secondary', 'standard']),
    showFirstButton: PropTypes.bool,
    showLastButton: PropTypes.bool,
    siblingCount: PropTypes.number,
    boundaryCount: PropTypes.number,
    className: PropTypes.string,
    disabled: PropTypes.bool
};

export default CustomPagination;