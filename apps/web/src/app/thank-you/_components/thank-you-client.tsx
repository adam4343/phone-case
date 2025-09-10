'use client'
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

interface Order {
  id: string;
  price: number;
  isPaid: boolean;
  phoneCase: {
    id: string;
    image: string;
    croppedImage: string;
    color: { hex: string; name: string };
    model: { name: string };
    material: { name: string };
  };
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function ThankYouClient({sessionId}: {sessionId: string}) {



  const query = useQuery({
    queryKey: ["order", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('No session ID provided');
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/by-session/${sessionId}`,
        { credentials: 'include' }
      );
      
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      return data.data as Order;
    },
    enabled: !!sessionId,
  });

  if (query.isLoading) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">We couldn't load your order details. Please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!query.data) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Order not found</h1>
            <p className="mt-2 text-muted-foreground">We couldn't find your order. Please check your order confirmation email.</p>
          </div>
        </div>
      </div>
    );
  }

  const order = query.data;

  return (
    <div className='bg-background'>
      <div className='mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
        <div className='max-w-xl'>
          <p className='text-base font-medium text-primary'>Thank you!</p>
          <h1 className='mt-2 text-4xl font-bold tracking-tight sm:text-5xl text-foreground'>
            Your case is on the way!
          </h1>
          <p className='mt-2 text-base text-muted-foreground'>
            We've received your order and are now processing it.
          </p>
          
          <div className='mt-12 text-sm font-medium'>
            <p className='text-foreground'>Order number</p>
            <p className='mt-2 text-muted-foreground'>{order.id}</p>
          </div>
        </div>

        <div className='mt-10 border-t border-border'>
          <div className='mt-10 flex flex-auto flex-col'>
            <h4 className='font-semibold text-foreground'>
              You made a great choice!
            </h4>
            <p className='mt-2 text-sm text-muted-foreground'>
              We at CaseCobra believe that a phone case doesn't only need to
              look good, but also last you for the years to come. We offer a
              5-year print guarantee: If your case isn't of the highest quality,
              we'll replace it for free.
            </p>
          </div>
        </div>

        <div className='flex space-x-6 overflow-hidden mt-4 rounded-xl bg-gray-900/5 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl'>
          <div className="relative flex items-center justify-center p-8 w-full">
            <div
              className="relative h-64 w-32 rounded-2xl shadow-lg"
              style={{ backgroundColor: order.phoneCase.color.hex }}
            >
              <img
                src={order.phoneCase.croppedImage}
                alt="Phone case preview"
                className="absolute inset-2 rounded-xl object-cover"
              />
            </div>
          </div>
        </div>

        <div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 py-10 text-sm'>
            <div>
              <p className='font-medium text-foreground'>Shipping address</p>
              <div className='mt-2 text-muted-foreground'>
                <address className='not-italic'>
                  <span className='block'>{order.shippingAddress.name}</span>
                  <span className='block'>{order.shippingAddress.street}</span>
                  <span className='block'>
                    {order.shippingAddress.postalCode} {order.shippingAddress.city}
                  </span>
                  <span className='block'>{order.shippingAddress.country}</span>
                </address>
              </div>
            </div>
            <div className="mt-6 sm:mt-0">
              <p className='font-medium text-foreground'>Billing address</p>
              <div className='mt-2 text-muted-foreground'>
                <address className='not-italic'>
                  <span className='block'>{order.billingAddress.name}</span>
                  <span className='block'>{order.billingAddress.street}</span>
                  <span className='block'>
                    {order.billingAddress.postalCode} {order.billingAddress.city}
                  </span>
                  <span className='block'>{order.billingAddress.country}</span>
                </address>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 border-t border-border py-10 text-sm'>
            <div>
              <p className='font-medium text-foreground'>Payment status</p>
              <p className='mt-2 text-muted-foreground'>
                {order.isPaid ? 'Paid' : 'Pending'}
              </p>
            </div>
            <div className="mt-6 sm:mt-0">
              <p className='font-medium text-foreground'>Shipping Method</p>
              <p className='mt-2 text-muted-foreground'>
                DHL, takes up to 3 working days
              </p>
            </div>
          </div>
        </div>

        <div className='space-y-6 border-t border-border pt-10 text-sm'>
          <div className='flex justify-between'>
            <p className='font-medium text-foreground'>Subtotal</p>
            <p className='text-muted-foreground'>{formatPrice(order.price)}</p>
          </div>
          <div className='flex justify-between'>
            <p className='font-medium text-foreground'>Shipping</p>
            <p className='text-muted-foreground'>{formatPrice(0)}</p>
          </div>
          <div className='flex justify-between border-t border-border pt-6'>
            <p className='font-medium text-foreground'>Total</p>
            <p className='font-medium text-foreground'>{formatPrice(order.price)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}