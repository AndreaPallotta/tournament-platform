import * as AWS from 'aws-sdk';
import { ObjectKey } from 'aws-sdk/clients/s3';
import logger from '../middleware/logger';
import { aws } from '../utils/env.config';
import CustomError from '../utils/error';

const s3 = new AWS.S3({
    accessKeyId: aws.general.accessKeyId,
    secretAccessKey: aws.general.secretAccessKeyId,
    region: aws.general.region, apiVersion: '2006-03-01'
});

export const createS3Folder = async (key: string, bucket: string) => {

    const folderPath = key.split('/').slice(0, -1).join('/');

    if (folderPath === '') return;

    const folderParams = {
        Bucket: bucket,
        Key: `${folderPath}/`,
    };

    try {
        await s3.headObject(folderParams).promise();
        return;
    } catch (err) {
        if (err.code !== 'NotFound') {
            throw new CustomError('Error uploading your picture');
        }
    }

    await s3.putObject(folderParams).promise();
    return;
}

export const deleteS3Folder = async (key: string, bucket: string = 'aardvark-tournament-bucket') => {

    const folderPath = `${key}/`;

    const deleteFolderParams = {
        Bucket: bucket,
        Key: folderPath
    };

    try {
        const folderObjects = await s3.listObjectsV2({
            Bucket: bucket,
            Prefix: folderPath,
        }).promise();

        const keys = folderObjects.Contents?.map(obj => {
            return { Key: obj.Key as ObjectKey }
        });

        if (!keys || keys.length === 0) {
            // delete folder itself
            await s3.deleteObject(deleteFolderParams).promise();
            return;
        };

        // delete files within folder
        await s3.deleteObjects({
            Bucket: bucket,
            Delete: { Objects: keys }
        }).promise();

        // delete folder itself
        await s3.deleteObject(deleteFolderParams).promise();

        return;
    } catch (err) {
        throw err;
    }
}

export const uploadFile = async (key: string, body: Buffer, bucket: string = 'aardvark-tournament-bucket'): Promise<string> => {
    const params = {
        Bucket: bucket,
        Key: key,
        Body: body,
    };

    try {
        await createS3Folder(key, bucket);
        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (err) {
        logger.error(`Error uploading file: ${err.message}`);
        return '';
    }
}

export const downloadFile = async (key: string, bucket: string = 'aardvark-tournament-bucket'): Promise<Buffer> => {
    const params = {
        Bucket: bucket,
        Key: key,
    };

    try {
        const result = await s3.getObject(params).promise();
        return result.Body as Buffer;
    } catch (error) {
        logger.error(`Error downloading file: ${error.message}`);
        return Buffer.from('');
    }
}

export default s3;