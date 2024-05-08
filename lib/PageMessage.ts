/**
 * @class Message
 * @storage <protocol>:state
 * @storage <protocol>:broadcast
 * @storage <protocol>:<targetId>:<originId>
 */
export class PageMessage {
    protocol: string; // Message Protocol

    origin: string; // Sender Id
    target: string; // Target Id
    method: string; // Method Name
    data: any; // Response Data/Request Data

    error: string|false|null; // Error message, if null it indicates a request message, otherwise it indicates a response message
    id: number; // Message Id

    constructor(protocol: string) {
        this.protocol = protocol;

        this.origin = '';
        this.target = '';
        this.method = '';
        this.data = null;

        this.error = null;
        this.id = 0;
    }

    /** @desc counter */
    static countes: number = 0;

    /** @desc Create public/private broadcast messages */
    static CreateBroadcast({
        protocol,
        method,
        origin,
        target = '',
        data = null
    }: {
        protocol: string;
        method: string;
        origin: string;
        target?: string;
        data?: any;
    }) {
        const vo = new PageMessage(protocol);
        vo.method = method;
        vo.origin = origin;
        vo.target = target;
        vo.data = data;
        return vo;
    }

    /** @desc Create request message */
    static CreateRequest({
        protocol,
        method,
        origin,
        target,
        error = null,
        data = null,
        id = undefined,
    }: {
        protocol: string;
        method: string;
        origin: string;
        target: string;
        error?: null|string|false;
        data?: any;
        id?: number;
    }) {
        const vo = new PageMessage(protocol);
        vo.method = method;
        vo.origin = origin;
        vo.target = target;
        vo.error = error;
        vo.data = data;
        vo.id = id === undefined ? ++PageMessage.countes : id;
        return vo;
    }

    /** @desc Send Encode message */
    static Send(vo: PageMessage) {
        let name;
        let value;
        // Public/Private Broadcast
        if (vo.isBroadcast()) {
            name = vo.target ? `${vo.protocol}:${vo.target}` : `${vo.protocol}:broadcast`;
            value = JSON.stringify({
                data: vo.data,
                origin: vo.origin,
                method: vo.method,
            });
        }
        // Private Message
        else {
            name = `${vo.protocol}:${vo.target}:${vo.origin}`;
            value = JSON.stringify({
                id: vo.id,
                data: vo.data,
                error: vo.error,
                method: vo.method,
            });
        }

        window.localStorage.setItem(name, value);
        window.localStorage.removeItem(name);
    }
    
    /** @desc Decode message */
    static Decode({ pageId, event, protocol }: {
        pageId: string,
        protocol: string,
        event: StorageEvent,
    }): null|PageMessage {
        try {
            const key = event.key as string;
            const value = JSON.parse(event.newValue as string);

            if (!value || key.indexOf(protocol) !== 0) {
                return null;
            }

            // Broadcast
            if (
                typeof value.id === 'undefined' &&
                typeof value.method === 'string' &&
                typeof value.origin === 'string' &&
                typeof value.data !== 'undefined' &&
                (
                    key === `${protocol}:broadcast` ||
                    key.indexOf(`${protocol}:${pageId}`) === 0
                )
            ) {
                return PageMessage.CreateBroadcast({
                    protocol,
                    data: value.data,
                    method: value.method,
                    origin: value.origin,
                    target: key === `${protocol}:broadcast` ? '' : pageId,
                })
            }

            // Request
            if (
                typeof value.id === 'number' &&
                typeof value.method === 'string' &&
                typeof value.error !== 'undefined' &&
                typeof value.data !== 'undefined' &&
                key.indexOf(`${protocol}:${pageId}`) === 0
            ) {
                return PageMessage.CreateRequest({
                    protocol,
                    id: value.id,
                    data: value.data,
                    error: typeof value.error === 'string' ? value.error : value.error === false ? false : null,
                    method: value.method,
                    origin: key.replace(`${protocol}:${pageId}:`, ''),
                    target: pageId,
                });
            }
        } catch {}
        return null;
    }

    /** @desc is response message */
    isResponse() {
        return this.id > 0 && this.error !== null;
    }

    /** @desc is request message */
    isRequest() {
        return this.id > 0 && this.error === null;
    }

    /** @desc is broadcast message */
    isBroadcast(): boolean {
        return this.id === 0;
    }

    /** @desc Convert to response message */
    toResponse() {
        [this.target, this.origin] = [this.origin, this.target];
        if (this.error === null) {
            this.error = false;
        }
    }

    /** @desc Set error */
    setError(vo: false|Error) {
        if (vo === false) {
            this.error = false;
        } else {
            this.error = vo.stack || vo.message || 'request error';
        }
    }

    /** @desc Get error */
    getError(): null|Error {
        return this.error ? new Error(this.error) : null;
    }

    /** @desc Set data */
    setData(vo: any) {
        this.data = vo;
    }

    /** @desc Get data */
    getData(): any {
        return this.data || null;
    }
}