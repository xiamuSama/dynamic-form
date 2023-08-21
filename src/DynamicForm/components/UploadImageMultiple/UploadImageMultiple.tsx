import { UPYunUrl } from '@/constants';
import { getOssUploadStsToken } from '@/services/OSS';
import { createOSS, isError } from '@/utils';
import { rejectedToResolve } from '@/utils/fetch-helper/deprecatedHelper';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import classnames from 'classnames';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const defaultImageTypes = ['jpeg', 'jpg', 'png', 'gif'];
const accessToken = localStorage.getItem('accessToken');

function getBase64(img: Blob, callback: (result: string) => any) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
}

interface Props {
    value?: string[];
    onChange?: (url?: string[]) => void;
    /**
     * 限制上传的文件类型
     */
    imageTypes?: string[];
    imageSize?: number; // 上传文件大小，限制为 不超过 多少 MB
    /**
     * ali oss 上传的 类型参数
     */
    type?: string;
    style?: React.CSSProperties;
    /**
     * 文件的预览的前缀
     */
    urlPrefix?: string;
    /**
     * 限制上传文件的长宽
     */
    limit?: {
        width?: number;
        height?: number;
    };
    limitCount?: number;
    disabled?: boolean;
    className?: string;
}

const UploadImage = forwardRef<typeof Upload, Props>(
    (
        {
            value,
            onChange,
            className,
            imageTypes = defaultImageTypes,
            imageSize = 5,
            type = 'CREAMS_IMAGE',
            style,
            urlPrefix = UPYunUrl,
            limit,
            disabled = false,
            limitCount = 1,
        },
        ref
    ) => {
        const [imgUrls, setImgUrls] = useState<any[] | undefined>();

        const [uploading, setUploading] = useState(false);

        const isVideo = useMemo(() => {
            if (imageTypes.includes('mp4')) {
                return true;
            }
            return false;
        }, [imageTypes]);

        const describe = useMemo(() => {
            if (isVideo) {
                return '视频';
            }
            return '图片';
        }, [isVideo]);
        useEffect(() => {
            setImgUrls(
                value?.map((v, i) => ({
                    uid: `-${i}`,
                    name: v,
                    url: `${v.includes('http') ? '' : urlPrefix}${v}`,
                    status: 'done',
                }))
            );
        }, [value]);

        const beforeUpload = async (file: File) => {
            const isAllowed = imageTypes.map(type => (isVideo ? `video/${type}` : `image/${type}`)).includes(file.type);
            if (!isAllowed) {
                message.error(`你只能上传 ${imageTypes.join('/')} 类型的${describe}!`);
            }
            const isLtSize = file.size / 1024 / 1024 < imageSize;
            if (!isLtSize) {
                message.error(`${describe}大小必须小于${imageSize}MB!`);
            }

            const uploadFile = resolution => {
                setUploading(true);
                if (isAllowed && isLtSize) {
                    getOssUploadStsToken({
                        query: {
                            type,
                            // @ts-ignore
                            time: new Date().valueOf(),
                        },
                        plugin: {
                            rejected: rejectedToResolve,
                        },
                    })
                        .then(result => {
                            if (isError(result)) {
                                return;
                            }
                            const client = createOSS(result);
                            const dotIndex = file.name.lastIndexOf('.');
                            const fileType = dotIndex !== -1 ? file.name.substring(dotIndex + 1) : undefined;
                            const fileName = `${result.location!.path}${result.location!.name}.${fileType}`;
                            client
                                .multipartUpload(fileName, file, {
                                    headers: {
                                        'Content-Disposition': `inline;filename=${encodeURI(file.name)}`,
                                    },
                                })
                                .then(res => {
                                    const url = res.name.split('CREAMS')[1];
                                    file['url'] = `${url.includes('http') ? '' : urlPrefix}${url}`;
                                    resolution(file);
                                })
                                .catch(err => {
                                    message.error(err);
                                });
                        })
                        .finally(() => setUploading(false));
                }
            };

            /**
             * 检测待上传图片的大小是否符合要求
             */
            const outFile = new Promise<File>(resolutionFunc => {
                getBase64(file, result => {
                    if (file.type?.includes('video')) {
                        uploadFile(resolutionFunc);
                    }
                    const img = new Image();
                    img.src = result;
                    img.onload = e => {
                        const { width, height } = img;
                        if (limit && Object.keys(limit).length > 0) {
                            if ((limit.width && limit.width !== width) || (limit.height && limit.height !== height)) {
                                return message.warn(
                                    `当前${describe}大小为 ${width}*${height}, 不符合要求(${limit.width || '任意'}*${limit.height || '任意'})`
                                );
                            }
                        }
                        uploadFile(resolutionFunc);
                    };
                });
            });
            await outFile;

            return false;
        };
        const classNames = classnames(className, styles['avatar-uploader']);
        return (
            <Upload
                style={style}
                accept={imageTypes.map(item => (isVideo ? `video/${item}` : `image/${item}`)).join(',')}
                name="file"
                multiple
                listType="picture-card"
                className={classNames}
                fileList={imgUrls}
                onChange={v => {
                    const fileList = v.fileList;
                    setImgUrls(fileList);
                    if (fileList?.every(i => i.status === 'done' || !i.status)) {
                        onChange?.(fileList?.map(i => i?.url?.replace(urlPrefix, '') || '') || []);
                    }
                }}
                beforeUpload={beforeUpload}
                headers={{
                    Authorization: `Bearer ${accessToken}`,
                }}
                disabled={disabled}
                ref={ref}
            >
                {(imgUrls?.length || 0) < limitCount ? (
                    <div>
                        {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                        <div>点击上传{describe}</div>
                    </div>
                ) : null}
            </Upload>
        );
    }
);

export default UploadImage;
