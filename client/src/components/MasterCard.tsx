import { useState, useRef } from 'react';
import { Heart, Calendar, Star, MapPin, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Master } from "@/data/mockMasters";

interface MasterCardProps {
  master: Master;
  onSelect: (master: Master) => void;
  onSwipe?: (direction: 'up' | 'down') => void;
  isMobile?: boolean;
}

export const MasterCard = ({ master, onSelect, onSwipe, isMobile = false }: MasterCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLiked, setIsLiked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  console.log('MasterCard render:', master.name, 'isMobile:', isMobile);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    console.log('Touch start');
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    // Предотвращаем pull-to-refresh только при свайпе вниз от верха
    if (deltaY > 0 && window.scrollY === 0) {
      e.preventDefault();
    }
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;
    console.log('Touch end, drag offset:', dragOffset);
    if (Math.abs(dragOffset.y) > 80) {
      const direction = dragOffset.y > 0 ? 'down' : 'up';
      console.log('Triggering swipe:', direction);
      onSwipe?.(direction);
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    onSelect(master);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Booking clicked for:', master.name);
  };

  const handleCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Calendar clicked for:', master.name);
  };

  const transform = isDragging && isMobile
    ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.y * 0.1}deg)`
    : '';

  return (
    <Card 
      ref={cardRef}
      className={`relative border-0 rounded-3xl bg-card cursor-pointer overflow-hidden transition-transform duration-300 shadow-lg ${
        isMobile 
          ? 'h-full w-full max-w-none' 
          : 'h-[400px] w-[600px] hover:scale-105'
      }`}
      style={{ 
        transform,
        touchAction: isMobile ? 'pan-y' : 'auto'
      }}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        <img 
          src={master.image} 
          alt={master.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {master.isVideo && (
          <div className="absolute top-4 right-4">
            <div className="bg-black/50 rounded-full p-2">
              <Play className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      {isMobile ? (
        <>
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 z-10">
            <div className="flex flex-col items-center">
              <Button 
                size="icon" 
                variant="ghost" 
                className={`rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors ${isLiked ? 'text-red-500' : ''}`}
                onClick={handleLike}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <span className="text-white text-sm font-medium mt-1">{master.likes + (isLiked ? 1 : 0)}</span>
            </div>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={handleCalendar}
            >
              <Calendar className="w-6 h-6" />
            </Button>
            
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src={master.avatar} />
              <AvatarFallback>{master.name[0]}</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg">{master.name}</h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{master.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{master.location}</span>
              <span className="text-sm font-semibold">{master.price}</span>
            </div>
            
            <p className="text-sm mb-3 opacity-90">{master.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {master.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
            
            <Button 
              className="w-full gradient-bg text-white font-semibold rounded-full tiktok-shadow"
              onClick={handleBooking}
            >
              Записаться
            </Button>
          </div>
        </>
      ) : (
        /* Desktop Layout */
        <>
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={master.avatar} />
                <AvatarFallback>{master.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-white text-lg">{master.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-white text-sm">{master.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className={`rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors ${isLiked ? 'text-red-500' : ''}`}
                onClick={handleLike}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full bg-black/20 hover:bg-black/40 text-white"
                onClick={handleCalendar}
              >
                <Calendar className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{master.location}</span>
              <span className="text-sm font-semibold">{master.price}</span>
              <span className="text-sm">• {master.likes + (isLiked ? 1 : 0)} лайков</span>
            </div>
            
            <p className="text-sm mb-3 opacity-90">{master.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {master.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
            
            <Button 
              className="w-full gradient-bg text-white font-semibold rounded-full tiktok-shadow"
              onClick={handleBooking}
            >
              Записаться
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
