import { PageMessage } from "./PageMessage";

/** @type id */
export type PageKey = ((vo: Page) => boolean)|string|null;

/** @type page */
export type Page = {
    id: string; // page id
    name?: string; // page name
    data?: any; // page data
};

/** @type ready callback */
export type ReadyCallback = () => Promise<any|void>;

/** @type event callback */
export type EventCallback = (message: PageMessage) => Promise<any|void>;