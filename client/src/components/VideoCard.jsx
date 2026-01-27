import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const VideoCard = ({ video }) => {
    return (
        <Link to={`/resource/${video._id}`} className="group">
            <div className="flex flex-col gap-3">
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                    <img
                        src={video.thumbnailUrl || '/api/placeholder/400/225'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs font-medium text-white">
                        12:45 {/* Placeholder duration */}
                    </div>
                </div>

                {/* Info */}
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        {video.uploader?.avatar ? (
                            <img src={video.uploader.avatar} alt={video.uploader.username} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                {video.uploader?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
                            {video.title}
                        </h3>
                        <div className="text-zinc-500 text-sm mt-1">
                            {video.uploader?.username || 'Unknown User'}
                        </div>
                        <div className="text-zinc-500 text-sm flex items-center gap-1">
                            <span>{video.views || 0} views</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;
