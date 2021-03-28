import * as cron from 'node-cron';
import FileUploader from './file-uploader';
import { ConstantUtil } from './util/constant';
import { LoggerUtil } from './util/logger';

export default class Worker {

    public start(): void {
        const fileUploader = new FileUploader();
        cron.schedule('* * * * *', async () => {
            LoggerUtil.info('Worker running. Checking for files to upload');
            const result = fileUploader.uploadFilesToStrapi();
            // tslint:disable-next-line:no-console
        });
    }
}
