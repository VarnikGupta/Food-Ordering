import React from 'react'

import css from './HeroComponent.module.css'

import food1Img from '../../utils/images/food1.jpg';
import food2Img from '../../utils/images/food2.jpg';
import food3Img from '../../utils/images/food3.jpg';

import GalleryImgCard from '../../utils/GalleryImgCard/GalleryImgCard'

const HeroComponent = () => {
  return <div className={css.outerDiv}>
    <div className={css.innerDiv}>
      <div className={css.scr1}>
        <GalleryImgCard imgSrc={food1Img} />
      </div>
      <div className={css.scr2}>
          <GalleryImgCard imgSrc={food2Img} />
          <GalleryImgCard imgSrc={food3Img} />
          <GalleryImgCard imgSrc={food2Img} />
          <GalleryImgCard imgSrc={food3Img} />
      </div>
    </div>
  </div>
}

export default HeroComponent