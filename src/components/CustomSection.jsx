import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Main CustomSection component that renders a dynamic section with elements
const CustomSection = ({ data, isSeparatePage = false }) => {
    const { id, heading_name, background_color, text_color, custom_section_elements } = data;

    if (!custom_section_elements || custom_section_elements.length === 0) {
        return null;
    }

    const elements = [...custom_section_elements].sort((a, b) => a.sort_order - b.sort_order);
    const textColor = text_color || 'var(--primary)';

    return (
        <section
            id={id}
            className={isSeparatePage ? "pt-4 pb-16" : "py-16"}
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
        case 'image_carousel':
            return <CarouselElement config={config} index={index} />;
        case 'text_box':
            return <TextBoxElement config={config} index={index} />;
        case 'card':
            return <CardElement config={config} index={index} />;
        case 'image':
            return <ImageElement config={config} index={index} />;
        case 'video':
            return <VideoElement config={config} index={index} />;
        case 'qr_code':
            return <QRCodeElement config={config} index={index} />;
        case 'list':
            return <ListElement config={config} index={index} />;
        case 'button':
            return <ButtonElement config={config} index={index} />;
        case 'table':
            return <TableElement config={config} index={index} />;
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
            style={{ color: 'var(--text-main)' }}
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
                        <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-main)' }}>
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
                            style={{ backgroundColor: 'var(--primary)' }}
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

// Carousel Element - Ported from Gallery.jsx slider
const CarouselElement = ({ config, index }) => {
    const { images = [] } = config;
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [direction, setDirection] = React.useState(0);

    if (images.length === 0) return null;

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 500 : -500, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (dir) => ({ zIndex: 0, x: dir < 0 ? 500 : -500, opacity: 0 })
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
        >
            <div className="relative w-full max-w-4xl h-[400px] md:h-[500px] overflow-hidden rounded-xl shadow-2xl">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="absolute inset-0"
                    >
                        <img
                            src={images[currentIndex].url}
                            alt={images[currentIndex].alt || ''}
                            className="w-full h-full object-cover"
                        />
                        {images[currentIndex].caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-4 text-white text-center">
                                {images[currentIndex].caption}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm text-white transition-all">
                    <ChevronLeft size={30} />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm text-white transition-all">
                    <ChevronRight size={30} />
                </button>
            </div>

            <div className="flex gap-2 mt-4">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                        }}
                        className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-stone-800' : 'w-2 bg-stone-300'}`}
                        style={{ backgroundColor: idx === currentIndex ? 'var(--primary)' : '#d1d5db' }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

// QR Code Element - Using public QR API
const QRCodeElement = ({ config, index }) => {
    const { content = '' } = config;
    if (!content) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center py-6"
        >
            <div className="p-4 bg-white rounded-2xl shadow-xl inline-block border-8 border-stone-50">
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(content)}`}
                    alt="QR Code"
                    className="w-[200px] h-[200px] md:w-[250px] md:h-[250px]"
                />
            </div>
            <p className="mt-4 text-sm opacity-60 font-medium">Scan to visit</p>
        </motion.div>
    );
};

// List Element - Bullet points or numbered items
const ListElement = ({ config, index }) => {
    const { items = [], type = 'bullet' } = config;
    if (items.length === 0) return null;

    const Tag = type === 'numbered' ? 'ol' : 'ul';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="max-w-4xl mx-auto w-full"
        >
            <Tag className={`space-y-4 ${type === 'numbered' ? 'list-decimal pl-6' : 'list-none'}`}>
                {items.map((item, i) => (
                    <li key={i} className="flex gap-4 items-start text-lg md:text-xl">
                        {type === 'bullet' && (
                            <span className="mt-2 w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }} />
                        )}
                        <span>{item}</span>
                    </li>
                ))}
            </Tag>
        </motion.div>
    );
};

// Button Element - Call to action
const ButtonElement = ({ config, index }) => {
    const { label = 'Click Here', url = '', style = 'solid', alignment = 'center' } = config;

    const alignmentClass = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`flex w-full ${alignmentClass[alignment]}`}
        >
            <a
                href={url || '#'}
                target={url && url.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className={`inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${style === 'outline'
                    ? 'border-2 border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:text-white'
                    : 'bg-[var(--primary)] text-white hover:bg-opacity-90'
                    }`}
                style={style === 'outline' ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : { backgroundColor: 'var(--primary)', color: 'white' }}
            >
                {label}
            </a>
        </motion.div>
    );
};

// Table Element - Structured Grid
const TableElement = ({ config, index }) => {
    const { rows = [], hasHeader = true } = config;
    if (rows.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="w-full max-w-5xl mx-auto overflow-x-auto rounded-xl shadow-lg border border-stone-100"
        >
            <table className="w-full border-collapse bg-white">
                <thead>
                    {hasHeader && rows.length > 0 && (
                        <tr className="bg-stone-50 border-b-2 border-stone-100">
                            {rows[0].map((cell, i) => (
                                <th key={i} className="p-4 text-left font-bold text-stone-800 border-r border-stone-50 last:border-r-0">
                                    {cell}
                                </th>
                            ))}
                        </tr>
                    )}
                </thead>
                <tbody className="divide-y divide-stone-50">
                    {rows.slice(hasHeader ? 1 : 0).map((row, i) => (
                        <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className="p-4 text-stone-600 border-r border-stone-50 last:border-r-0">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    );
};

export default CustomSection;
export { GalleryElement, TextBoxElement, CardElement, ImageElement, VideoElement, CarouselElement, QRCodeElement, ListElement, ButtonElement, TableElement };
