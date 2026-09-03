package com.rivals.common;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;

/**
 * A {@link Pageable} addressed by an arbitrary (offset, limit) pair rather than a page number,
 * matching the {@code limit}/{@code offset} query params in contracts/squads.md and
 * contracts/leaderboards.md (SC-007 pagination).
 */
public final class OffsetLimitPageable implements Pageable {

    private final long offset;
    private final int limit;
    private final Sort sort;

    private OffsetLimitPageable(long offset, int limit, Sort sort) {
        this.offset = offset;
        this.limit = limit;
        this.sort = sort;
    }

    public static OffsetLimitPageable of(long offset, int limit, Sort sort) {
        return new OffsetLimitPageable(offset, limit, sort);
    }

    @Override
    public int getPageNumber() {
        return (int) (offset / limit);
    }

    @Override
    public int getPageSize() {
        return limit;
    }

    @Override
    public long getOffset() {
        return offset;
    }

    @Override
    @NonNull
    public Sort getSort() {
        return sort;
    }

    @Override
    @NonNull
    public Pageable next() {
        return new OffsetLimitPageable(offset + limit, limit, sort);
    }

    @Override
    @NonNull
    public Pageable previousOrFirst() {
        return hasPrevious() ? new OffsetLimitPageable(offset - limit, limit, sort) : first();
    }

    @Override
    @NonNull
    public Pageable first() {
        return new OffsetLimitPageable(0, limit, sort);
    }

    @Override
    @NonNull
    public Pageable withPage(int pageNumber) {
        return new OffsetLimitPageable((long) pageNumber * limit, limit, sort);
    }

    @Override
    public boolean hasPrevious() {
        return offset > 0;
    }
}
