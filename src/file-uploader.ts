
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import moment from 'moment';
import needle from 'needle';
import { LoggerUtil } from './util/logger';

export default class FileUploader {

    public async uploadFilesToStrapi() {
        const files = this.getFilesToBeUploaded();
        const filesArray = [];
        if (files.length > 0) {
            files.forEach((item) => {
                filesArray.push(this.upload(item));
            });

            await Promise.all(filesArray);
            LoggerUtil.info('uploadFilesToStrapi', 'done');
            return 'done';
        }

        LoggerUtil.info('uploadFilesToStrapi', 'No file to uploa');
        return 'No file to upload';
    }

    private async upload(data: any): Promise<any> {
        try {
            const result = await this.makeHttpRequest(data);
            return result.data;
        } catch (err) {
            console.log(err);
            LoggerUtil.error('upload', ', Error uploading file to strapi | error ', err);
        }
    }

    private getTimeOfService(time: string): string {
        return time === '1' ? '7:30am' : '9:00am';
    }

    private getFilesToBeUploaded(): string[] {
        const fileNames = [];
        fs.readdirSync('public').forEach((file) => {
            const dateFormat = file.split('.')[0];
            const getDate = dateFormat.slice(0, dateFormat.lastIndexOf('-'));
            const getOriginalTitle = dateFormat.slice(dateFormat.lastIndexOf('-') + 1, dateFormat.length);
            const getService = getOriginalTitle.slice(getOriginalTitle.lastIndexOf('#') + 1, getOriginalTitle.length);
            const getMessageTitle = getOriginalTitle.slice(0, getOriginalTitle.lastIndexOf('#'));
            const isToday = moment().isSame(getDate, 'day');
            const date = moment(getDate).format('LL');
            const timeOfService = this.getTimeOfService(getService);
            if (isToday) {
              fileNames.push({
                  title: `${getMessageTitle} | ${timeOfService} | SUNDAY | ${date}`,
                  path: `public/${file}`,
                  file,
              });
            }
        });
        return fileNames;
    }

    private async makeHttpRequest(body: any): Promise<any> {
        try {
             const data = {
                'data': JSON.stringify({
                    title: body.title,
                    description: body.title,
                }),
                'files.event': {
                    file: body.path,
                    content_type: 'image/jpeg',
                },
            };

             const url = `${process.env.STRAPI_HOST}/${process.env.STRAPI_ENTITY}`;
             console.log(url);
             const result = await needle('post', url, data, {
                multipart: true,
            });

            console.log(result);
             return result;

        } catch (error) {
            LoggerUtil.error('makeHttpRequest', 'Error initiating http request to strapi admin | error ', error);
        }
    }
}
