import React, { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

interface LinkPreviewProps {
  preview: LinkPreviewData;
  isSentByMe: boolean;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ preview, isSentByMe }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleClick = () => {
    window.open(preview.url, "_blank", "noopener,noreferrer");
  };

  // Extract domain from URL for display
  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  // Truncate description
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <div
      onClick={handleClick}
      className={`mt-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border ${
        isSentByMe
          ? "bg-blue-700/30 border-blue-400/30 hover:bg-blue-700/40"
          : "bg-gray-700/50 border-gray-600/30 hover:bg-gray-700/70"
      }`}
    >
      {/* Image Section */}
      {preview.image && !imageError && (
        <div className="relative w-full h-32 sm:h-36 bg-gray-800/50">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt={preview.title || "Link preview"}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        </div>
      )}

      {/* Fallback when no image or image fails */}
      {(!preview.image || imageError) && (
        <div
          className={`w-full h-20 flex items-center justify-center ${
            isSentByMe ? "bg-blue-800/30" : "bg-gray-800/50"
          }`}
        >
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Content Section */}
      <div className="p-2.5 sm:p-3">
        {/* Site name and favicon */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {preview.favicon && !imageError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview.favicon}
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Globe className="w-3.5 h-3.5 text-gray-400" />
          )}
          <span
            className={`text-xs font-medium ${
              isSentByMe ? "text-blue-200" : "text-gray-400"
            }`}
          >
            {preview.siteName || getDomain(preview.url)}
          </span>
          <ExternalLink className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
        </div>

        {/* Title */}
        {preview.title && (
          <h4
            className={`text-sm font-semibold leading-snug mb-1 ${
              isSentByMe ? "text-white" : "text-gray-100"
            }`}
          >
            {truncateText(preview.title, 80)}
          </h4>
        )}

        {/* Description */}
        {preview.description && (
          <p
            className={`text-xs leading-relaxed ${
              isSentByMe ? "text-blue-100/80" : "text-gray-300/80"
            }`}
          >
            {truncateText(preview.description, 120)}
          </p>
        )}

        {/* URL display - only show if no title */}
        {!preview.title && (
          <p
            className={`text-xs truncate ${
              isSentByMe ? "text-blue-200" : "text-gray-400"
            }`}
          >
            {preview.url}
          </p>
        )}
      </div>
    </div>
  );
};

export default LinkPreview;
