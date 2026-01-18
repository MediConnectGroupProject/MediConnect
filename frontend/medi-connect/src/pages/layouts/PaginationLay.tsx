import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination'
import { getPaginationPages } from '../../utils/getPagination'

type PaginationProps = {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function PaginationLay({
    page,
    totalPages,
    onPageChange,
}: PaginationProps) {
    const pages = getPaginationPages(page, totalPages, 1)

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        className='cursor-pointer'
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        aria-disabled={page === 1}
                    />
                </PaginationItem>

                {pages.map((p, i) => (
                    <PaginationItem key={i}>
                        {p === "ellipsis" ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                className={`cursor-pointer ${page === p ? 'bg-gray-500! text-white! hover:bg-gray-500!' : ''
                                    }`}
                                isActive={page === p}
                                onClick={() => onPageChange(p)}
                            >
                                {p}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        className='cursor-pointer'
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                        aria-disabled={page === totalPages}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination >
    )
}
