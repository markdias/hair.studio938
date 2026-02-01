import React from 'react';
import { motion } from 'framer-motion';

// Main CustomSection component that renders a dynamic section with elements
const CustomSection = ({ data }) => {
    const { id, heading_name, background_color, text_color, custom_section_elements } = data;

    if (!custom_section_elements || custom_section_elements.length === 0) {
        return null;
    }

    const elements = [...custom_section_elements].sort((a, b) => a.sort_order - b.sort_order);
    const textColor = text_color || 'var(--primary-brown)';

    return (
        <section
            id={`custom-section-${id}`}
            className="py-16"
            style={{ backgroundColor: background_color || 'transparent', color: textColor }}
        >
            <div className="container mx-auto px-4">
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ fontSize: '3rem', color: textColor, marginBottom: '15px' }}
                    >
                        {heading_name}
                    </motion.h2>
                    <div style={{ width: '60px', height: '2px', backgroundColor: textColor, margin: '0 auto' }}></div>
                </div>

                <div className="space-y-12">
                    {elements.map((element, index) => (
                        <ElementRenderer key={element.id} element={element} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Element renderer that delegates to specific component based on type
const ElementRenderer = ({ element, index }) => {
    const { element_type, config } = element;

    switch (element_type) {
        case 'gallery':
            return <GalleryElement config={config} index={index} />;
        case 'text_box':
            return <TextBoxElement config={config} index={index} />;
        case 'card':
            return <CardElement config={config} index={index} />;
        case 'image':
            return <ImageElement config={config} index={index} />;
        case 'video':
            return <VideoElement config={config} index={index} />;
        default:
            return null;
    }
};

// Gallery Element - Multiple images in a grid
const GalleryElement = ({ config, index }) => {
    const { images = [], columns = 3 } = config;

    if (!images || images.length === 0) return null;

    const gridCols = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
        >
            <div className={`grid ${gridCols[columns] || gridCols[3]} gap-6`}>
                {images.map((img, idx) => (
                    <div key={idx} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow">
                        <img
                            src={img.url}
                            alt={img.alt || ''}
                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <p className="text-white text-sm">{img.caption}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// Text Box Element - Rich text content
const TextBoxElement = ({ config, index }) => {
    const { content = '', alignment = 'left', fontSize = 'medium' } = config;

    if (!content) return null;

    const alignmentClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    const fontSizeClass = {
        small: 'text-base',
        medium: 'text-lg',
        large: 'text-xl'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`max-w-4xl mx-auto ${alignmentClass[alignment]} ${fontSizeClass[fontSize]}`}
            style={{ color: 'var(--text-dark)' }}
        >
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
        </motion.div>
    );
};

// Card Element - Title, description, image & link
const CardElement = ({ config, index }) => {
    const { title = '', description = '', image_url = '', link_url = '', link_text = '' } = config;

    if (!title && !description && !image_url) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="max-w-2xl mx-auto"
        >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                {image_url && (
                    <img
                        src={image_url}
                        alt={title}
                        className="w-full h-64 object-cover"
                    />
                )}
                <div className="p-6">
                    {title && (
                        <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            {description}
                        </p>
                    )}
                    {link_url && link_text && (
                        <a
                            href={link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                            style={{ backgroundColor: 'var(--primary-brown)' }}
                        >
                            {link_text}
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Image Element - Single image with caption
const ImageElement = ({ config, index }) => {
    const { url = '', alt = '', caption = '', size = 'full' } = config;

    if (!url) return null;

    const sizeClass = {
        full: 'w-full',
        large: 'w-full max-w-4xl mx-auto',
        medium: 'w-full max-w-2xl mx-auto',
        small: 'w-full max-w-md mx-auto'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={sizeClass[size]}
        >
            <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                    src={url}
                    alt={alt}
                    className="w-full h-auto"
                />
                {caption && (
                    <div className="bg-white p-4">
                        <p className="text-gray-700 text-sm text-center italic">{caption}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Video Element - Embedded or uploaded video
const VideoElement = ({ config, index }) => {
    const { url = '', type = 'upload', autoplay = false } = config;

    if (!url) return null;

    // Extract YouTube video ID if it's a YouTube URL
    const getYouTubeId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const youtubeId = isYouTube ? getYouTubeId(url) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="max-w-4xl mx-auto"
        >
            <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                {type === 'upload' || !isYouTube ? (
                    <video
                        src={url}
                        controls
                        autoPlay={autoplay}
                        muted={autoplay}
                        className="absolute top-0 left-0 w-full h-full"
                    />
                ) : youtubeId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}${autoplay ? '?autoplay=1' : ''}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full"
                    />
                ) : (
                    <iframe
                        src={url}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full"
                    />
                )}
            </div>
        </motion.div>
    );
};

export default CustomSection;
export { GalleryElement, TextBoxElement, CardElement, ImageElement, VideoElement };
