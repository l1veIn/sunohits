'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    loading?: boolean
    className?: string
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    loading = false,
    className
}: PaginationProps) {
    if (totalPages <= 1) return null

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible + 2) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage <= 3) {
                // Near start: 1, 2, 3, 4, 5, ..., last
                for (let i = 2; i <= maxVisible; i++) {
                    pages.push(i)
                }
                pages.push('ellipsis')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                // Near end: 1, ..., last-4, last-3, last-2, last-1, last
                pages.push('ellipsis')
                for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                // Middle: 1, ..., current-1, current, current+1, ..., last
                pages.push('ellipsis')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push('ellipsis')
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className={`flex items-center justify-center gap-1 pt-4 pb-8 ${className || ''}`}>
            {/* Previous button */}
            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={currentPage === 1 || loading}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {getPageNumbers().map((page, idx) =>
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                        ...
                    </span>
                ) : (
                    <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        className="h-9 w-9"
                        disabled={loading}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </Button>
                )
            )}

            {/* Next button */}
            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={currentPage === totalPages || loading}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
