import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';



const ReviewsSection = ({ propertyId }) => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-secondary" />
            Reviews & Ratings
          </CardTitle>
        </div>
      </CardHeader>
     
  );
};

export default ReviewsSection;
