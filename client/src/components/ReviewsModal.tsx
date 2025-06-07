
import { useState } from 'react';
import { X, Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
}

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterName: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    author: 'Александра К.',
    avatar: '/placeholder.svg',
    rating: 5,
    date: '2 дня назад',
    text: 'Потрясающий мастер! Делала у Анны дизайн с градиентом и стразами - получилось просто шикарно. Работает очень аккуратно, рекомендую всем!',
    helpful: 12
  },
  {
    id: '2',
    author: 'Мария С.',
    avatar: '/placeholder.svg',
    rating: 5,
    date: '1 неделю назад',
    text: 'Хожу к Анне уже полгода. Всегда идеальный результат, маникюр держится 3-4 недели. Очень довольна!',
    helpful: 8
  },
  {
    id: '3',
    author: 'Елена М.',
    avatar: '/placeholder.svg',
    rating: 4,
    date: '2 недели назад',
    text: 'Хороший мастер, качественные материалы. Единственный минус - немного долго делает, но результат того стоит.',
    helpful: 5
  }
];

export const ReviewsModal = ({ isOpen, onClose, masterName }: ReviewsModalProps) => {
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  const handleLikeReview = (reviewId: string) => {
    const newLiked = new Set(likedReviews);
    if (newLiked.has(reviewId)) {
      newLiked.delete(reviewId);
    } else {
      newLiked.add(reviewId);
    }
    setLikedReviews(newLiked);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[80vh] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center">Отзывы о {masterName}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback>{review.author[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{review.author}</h4>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-foreground mb-3">{review.text}</p>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleLikeReview(review.id)}
                  >
                    <ThumbsUp className={`w-3 h-3 mr-1 ${likedReviews.has(review.id) ? 'fill-current text-primary' : ''}`} />
                    Полезно ({review.helpful + (likedReviews.has(review.id) ? 1 : 0)})
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
