/**
 *
 * Server
 *
 * * * * * * * * * * * * * * * * *
 * @author: Sanni Michael Tomiwa.   *
 * * * * * * * * * * * * * * * * *
 *
 */

import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { appErrorHandler, genericErrorHandler , notFound } from './middleware/error-middleware';
import { LoggerUtil } from './util/logger';
import Worker from './worker';

export class Server {

    private PORT = Number(process.env.PORT) || 9007;

    // Set app to be of type express.Application
    private app: express.Application;
    private httpServer: http.Server;

    constructor() {
        this.start();
    }

    /**
     * Start Server
     */
    private async start(): Promise<boolean> {
        LoggerUtil.info('Starting server...');
        this.app = express();
        await this.config();
        await this.routes();
        await this.serverListen();

        return true;
    }

    /**
     * Application Config
     */
    private async config(): Promise<boolean> {

        // Express middleware
        this.app.use(compression());
        this.app.use(helmet());
        this.app.use(express.json());

        return true;
    }

    /**
     * Application routes
     */
    private async routes(): Promise<boolean> {

        this.app.use('/', (req , res, next) => {
            return res.send('Welcome to strapi-file-uploader');
        });
        // // Error handlers
        this.app.use(appErrorHandler);
        this.app.use(genericErrorHandler);

        // Not found
        this.app.use(notFound);
        return true;
    }

    /**
     * Listen
     */
    private async serverListen(): Promise<boolean> {

        this.httpServer = http.createServer(this.app);

        this.httpServer.listen({
            port: this.PORT,
            host: 'localhost',
        });
        this.httpServer.on('listening', async () => {
            LoggerUtil.info(`Server is listening on http://localhost:${this.PORT}`);
            // tslint:disable-next-line:no-unused-expression
            new Worker().start();
        });
        this.httpServer.on('error', (error: NodeJS.ErrnoException) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind = (typeof this.PORT === 'string') ? 'Pipe ' + this.PORT : 'Port ' + this.PORT;

            switch (error.code) {
                case 'EACCES':
                    LoggerUtil.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                case 'EADDRINUSE':
                    LoggerUtil.error(`${bind} is already in use`);
                    process.exit(1);
                default:
                    throw error;
            }
        });

        return true;
    }

}
