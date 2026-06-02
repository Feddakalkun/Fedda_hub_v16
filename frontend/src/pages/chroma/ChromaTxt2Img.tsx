import { Txt2ImgPage } from '../zimage/ZImageTxt2Img';

const CHROMA_PRESETS = [
  { label: 'Square', w: 1152, h: 1152 },
  { label: 'Portrait', w: 896, h: 1344 },
  { label: 'Wide', w: 1344, h: 896 },
  { label: 'Tall', w: 832, h: 1488 },
];

export const ChromaTxt2Img = () => {
  return (
    <Txt2ImgPage
      storageKey="chroma_txt2img"
      workflowId="chroma1-hd-txt2img"
      familyLabel="Chroma1-HD"
      promptContext="zimage"
      accent="emerald"
      loraPrefixes={[]}
      loraPacks={[]}
      aspectPresets={CHROMA_PRESETS}
      enableLoras={false}
      defaultSteps={26}
    />
  );
};
