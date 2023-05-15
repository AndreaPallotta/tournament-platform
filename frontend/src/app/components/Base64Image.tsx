interface ImageProps {
    src: string;
    alt: string;
    type?: string;
    isFullURI?: boolean;
    style?: React.CSSProperties;
    [key: string]: any;
}

const Base64Image = ({
    src,
    alt,
    type = 'webp',
    isFullURI = false,
    style,
    ...props
}: ImageProps) => {
    const formatSrc = () => {
        return isFullURI ? src : `data:image/${type};base64,${src}`;
    };
    return <img src={formatSrc()} alt={alt} style={style} {...props} />;
};

export default Base64Image;
