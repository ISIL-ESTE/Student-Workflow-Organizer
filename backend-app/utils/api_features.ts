import { Document, Query } from 'mongoose'; // Import appropriate types for your use case

class APIFeatures<T extends Document> {
    query: Query<T[], T, {}, T, 'find'>;
    queryString: Record<string, string | string[]>;
    constructor(
        query: Query<T[], T>,
        queryString: Record<string, string | string[]>
    ) {
        this.query = query;
        this.queryString = queryString;
    }

    sort(): this {
        if (this.queryString.sort) {
            const sortBy = (this.queryString.sort as string)
                .split(',')
                .join(' ');
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    paginate(): this {
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    // Field Limiting ex: -----/user?fields=name,email,address
    limitFields(): this {
        if (this.queryString.fields) {
            const fields = (this.queryString.fields as string)
                .split(',')
                .join(' ');
            this.query = this.query.select(fields);
        }
        return this;
    }
}

export default APIFeatures;
