import { PageQueue } from "./PageQueue";
import { PageMessage } from "./PageMessage";
import { PageManager } from "./PageManager";
import { PageObserver } from "./PageObserver";
import { EventCallback, ReadyCallback, PageKey } from "./Contract.d";

/**
 * @class PageBridge
 */
export class PageBridge {
    timeout: number;
    protocol: string;

    /** @desc ready */
    readyState: boolean;
    readyCallbacks: ReadyCallback[];

    /** @desc Publish/Subscribe */
    queue: PageQueue;

    /** @desc Page Manager */
    manager: PageManager;

    /** @desc Publish/Subscribe */
    observer: PageObserver;

    constructor({
        name = '',
        data = {},
        timeout = 60 * 1000,
        protocol = 'bridge',
    }: {
        data?: any;
        name?: string;
        timeout?: number;
        protocol?: string;
    } = {}) {
        this.timeout = timeout;
        this.protocol = protocol;
        this.readyState = false;
        this.readyCallbacks = [];
        this.queue = new PageQueue;
        this.observer = new PageObserver;
        this.manager = new PageManager({ id: this.generate(), name, data });
        this.registerDefault();
        this.onCreated = this.onCreated.bind(this);
        this.onReceive = this.onReceive.bind(this);
        this.onDestroy = this.onDestroy.bind(this);
        window.addEventListener('pageshow', this.onCreated);
        window.addEventListener('pagehide', this.onDestroy);
        window.addEventListener('storage', this.onReceive);
    }

    /** @desc ready */
    async ready(callback: ReadyCallback) {
        if (this.readyState) {
            await callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }

    /** @desc Add event listener */
    on(method: string, callback: EventCallback) {
        this.observer.on(method, callback);
    }

    /** @desc Off event listener */
    off(method: string) {
        this.observer.off(method);
    }

    /** @desc Set page name */
    setName(name: string) {
        this.manager.setName(name);
        this.send({ method: '@bridge/update', data: this.manager.getPage() });
    }

    /** @desc Set page data */
    setData(data: object) {
        this.manager.setData(data);
        this.send({ method: '@bridge/update', data: this.manager.getPage() });
    }

    /** @desc Get page id */
    getId() {
        return this.manager.getId();
    }

    /** @desc Get page name */
    getName() {
        return this.manager.getName();
    }

    /** @desc Get page data */
    getData() {
        return this.manager.getData();
    }

    /** @desc Get page */
    getPage(id: PageKey = null) {
        return this.manager.getPage(id);
    }

    /** @desc Get pages */
    getPages(id: PageKey = null) {
        return this.manager.getPages(id);
    }

    /** @desc Send message */
    send({
        name = null,
        data = null,
        method,
    }: {
        name?: PageKey;
        method: string;
        data?: any;
    }) {
        const originId = this.manager.getId();
        const targets = name ? this.manager.getPages(name) : [{ id: '' }];
        targets.forEach((target) => {
            // Create message
            const message = PageMessage.CreateBroadcast({
                protocol: this.protocol,
                target: target.id,
                origin: originId,
                method,
                data,
            });
            // Send or execute
            if (target.id === originId) {
                // Execute current monitoring (current tense only)
                this.observer.emit(method, message);
            } else {
                // Execute current monitoring (only when broadcasting)
                if (target.id === '') {
                    this.observer.emit(method, message);
                }
                // Send message
                PageMessage.Send(message);
            }
        });
    }

    /** @desc Request message */
    request({
        method,
        data = null,
        target = undefined,
        timeout = undefined,
    }: {
        timeout?: number;
        target?: string;
        method: string;
        data?: any;
    }): Promise<any> {
        return new Promise((resolve, reject) => {
            // Get origin id
            const originId = this.manager.getId();
            // Create message
            const message = PageMessage.CreateRequest({
                protocol: this.protocol,
                origin: originId,
                target: target === undefined ? originId : target,
                method,
                data,
            });

            // Execute if send is itself, otherwise send
            if (message.target === originId) {
                this.observer
                    .emit(message.method, message)
                    .then(resolve)
                    .catch(reject);
            } else {
                // Get timeout
                const nTimeout = timeout === undefined ? this.timeout : timeout;

                // Add to queue
                this.queue.push({
                    message,
                    resolve,
                    reject,
                    timer: nTimeout > 0 ? setTimeout(() => {
                        if (this.queue.pop(message.id)) {
                            reject(new Error('timeout'));
                        }
                    }, nTimeout) : 0,
                });

                // Send message
                PageMessage.Send(message);
            }
        });
    }

    /** @Cycle Created */
    private onCreated() {
        this.registerPage();
    }

    /** @Cycle Receive */
    private onReceive(event: StorageEvent) {
        const message = PageMessage.Decode({
            protocol: this.protocol,
            pageId: this.manager.getId(),
            event,
        });
        if (!message) {
            return;
        }
        if (message.isBroadcast()) {
            this.observer.emit(message.method, message);
        } else if (message.isRequest()) {
            this.observer.emit(message.method, message).then((vo: any) => {
                message.setData(vo);
            }).catch((err: Error) => {
                message.setError(err);
            }).finally(() => {
                message.toResponse();
                PageMessage.Send(message);
            });
        } else if (message.isResponse()) {
            const error = message.getError();
            const result = this.queue.pop(message.id);
            if (result) {
                clearInterval(result.timer);
                error ? result.reject(error) : result.resolve(message.getData());
            }
        }
    }

    /** @Cycle Destroy */
    private onDestroy() {
        this.send({ method: '@bridge/delete', data: this.manager.getId() });
    }

    /** @desc Register default listener */
    private registerDefault() {
        /** @listen Create page */
        this.on('@bridge/create', async (vo: PageMessage) => {
            this.manager.setPage(vo.getData());
            // Return notification of own existence
            this.send({
                method: '@bridge/update',
                data: this.getPage(),
                name: vo.origin,
            });
        });
        /** @listen Update page */
        this.on('@bridge/update', async (vo: PageMessage) => {
            this.manager.setPage(vo.getData());
        });
        /** @listen Delete page */
        this.on('@bridge/delete', async (vo: PageMessage) => {
            this.manager.delPage(vo.getData());
        });
    }

    /** @desc Register page */
    private registerPage() {
        // Notify page online
        this.send({ method: '@bridge/create', data: this.getPage() });
        // Execute ready
        this.readyState = true;
        this.readyCallbacks.forEach((callback) => callback());
        this.readyCallbacks = [];
    }

    /** @desc Generate page id */
    private generate(): string {
        return (Date.now().toString(36) + '-' + Math.random().toString(36).substr(2)).toUpperCase();
    }
}