import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import { useRef, useState } from "react";
import Image from "next/image";

function Carousel({ images }: { images: string[] }) {
  const swiperRef = useRef<SwiperRef>(null);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0);
  return (
    <div>
      <Swiper
        grabCursor
        autoplay={{
          delay: 2500,
        }}
        slidesPerView={1}
        modules={[Pagination, A11y, Autoplay]}
        className="w-full h-[10rem]"
        ref={swiperRef}
        onSlideChange={(e) => setCurrentActiveIndex(e.realIndex)}
      >
        {images.map((x, index) => {
          return (
            <SwiperSlide key={x + index}>
              <div className="h-[10rem] md:h-[12.5rem] relative w-full">
                <Image
                  fill
                  className="object-cover"
                  sizes="100vw"
                  src={x}
                  alt={x}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="flex items-center justify-center space-x-2 mt-5">
        {images.map((x, index) => {
          return (
            <div
              key={x + "pagination" + index}
              className={`${currentActiveIndex === index
                  ? "bg-primary w-[10px] md:w-[30px]"
                  : "bg-card-foreground"
                } w-[5px] md:w-[10px] h-[5px] md:h-[10px] rounded-full transition-all`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Carousel;
