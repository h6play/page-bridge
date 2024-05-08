import { Page, PageKey } from "./Contract.d";

/** @class PageManager */
export class PageManager {
    pages: Page[]; // Pages
    current: Page; // Current page

    constructor({
        id, name, data
    }: {
        id: string;
        name: string;
        data: any;
    }) {
        this.pages = [];
        this.current = {
            id,
            name,
            data,
        };
        this.pages.push(this.current);
    }

    /** @desc Set id */
    setId(vo: string) {
        this.current.id = vo;
    }

    /** @desc Get id */
    getId() {
        return this.current.id;
    }

    /** @desc Set name */
    setName(vo: string) {
        this.current.name = vo;
    }

    /** @desc Get name */
    getName() {
        return this.current.name;
    }

    /** @desc Set data */
    setData(vo: object) {
        this.current.data = vo;
    }

    /** @desc Get data */
    getData() {
        return this.current.data;
    }

    /** @desc Get page */
    getPage(id: PageKey = null): null|Page {
        if (id === null) {
            return this.current;
        } else if (typeof id === 'string') {
            return this.pages.find((vo) => vo.name === id || vo.id === id) || null;
        } else if (typeof id === 'function') {
            return this.pages.find(id) || null;
        }
        return null;
    }

    /** @desc Get pages */
    getPages(id: PageKey = null): Page[] {
        if (id === null) {
            return this.pages;
        } else if (typeof id === 'string') {
            return this.pages.filter((vo) => vo.name === id || vo.id === id);
        } else if (typeof id === 'function') {
            return this.pages.filter((vo) => id(vo));
        }
        return this.pages;
    }

    /** @desc Delete page */
    delPage(id: string) {
        this.pages = this.pages.filter((vo) => vo.id !== id);
        this.current = this.pages.find((vo) => {
            return vo.id === this.current.id;
        }) || {
            id: '',
            name: this.current.name,
            data: this.current.data,
        };
    }

    /** @desc Update page */
    setPage(page: Page) {
        const index = this.pages.findIndex(item => item.id === page.id);
        if (index !== -1) {
            this.pages.splice(index, 1, page);
        } else {
            this.pages.push(page);
        }
        if (this.current.id === page.id) {
            this.current = page;
        }
    }
}