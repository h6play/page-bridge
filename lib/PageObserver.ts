import { EventCallback } from "./Contract.d";
import { PageMessage } from "./PageMessage";

/**
 * @class PageObserver
 * @desc Subscribe/Publish
 */
export class PageObserver {
    private events: { [key: string]: EventCallback };

    constructor() {
        this.events = {};
    }

    /** @desc publish event */
    async emit(name: string, message: PageMessage) {
        if (this.events[name]) {
            const result = this.events[name](message);
            if (result instanceof Promise) {
                return await result;
            }
            return result;
        }
        return undefined;
    }

    /** @desc Listen for events */
    on(name: string, callback: EventCallback) {
        this.events[name] = callback;
    }

    /** @desc Remove listening event */
    off(name: string) {
        delete this.events[name];
    }
}