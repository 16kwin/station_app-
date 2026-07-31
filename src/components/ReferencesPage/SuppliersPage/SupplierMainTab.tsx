// SupplierMainTab.tsx — read-only версия для клона (фуллскрин вынесен наружу)
import React, { useState } from 'react';
import type { CommonSupplierProps } from './SupplierCreatePage';
import Icon8 from '../../../assets/References/NomenclatureCreatePage/Icon8.svg';
import Icon10 from '../../../assets/References/NomenclatureCreatePage/Icon10.svg';
import Icon101 from '../../../assets/References/NomenclatureCreatePage/Icon101.svg';
import Icon41 from '../../../assets/References/NomenclatureCreatePage/Icon41.svg';
import Icon42 from '../../../assets/References/NomenclatureCreatePage/Icon42.svg';
import Icon11 from '../../../assets/References/NomenclatureCreatePage/Icon11.svg';
import Icon51 from '../../../assets/References/NomenclatureCreatePage/Icon51.svg';
import Icon52 from '../../../assets/References/NomenclatureCreatePage/Icon52.svg';
import Sup11 from '../../../assets/References/SupplierCreatePage/Sup11.svg';
import Sup12 from '../../../assets/References/SupplierCreatePage/Sup12.svg';
import Sup21 from '../../../assets/References/SupplierCreatePage/Sup21.svg';
import Sup22 from '../../../assets/References/SupplierCreatePage/Sup22.svg';
import Sup31 from '../../../assets/References/SupplierCreatePage/Sup31.svg';
import Sup32 from '../../../assets/References/SupplierCreatePage/Sup32.svg';
import Sup41 from '../../../assets/References/SupplierCreatePage/Sup41.svg';
import Sup42 from '../../../assets/References/SupplierCreatePage/Sup42.svg';
import Sup61 from '../../../assets/References/SupplierCreatePage/Sup61.svg';
import Sup62 from '../../../assets/References/SupplierCreatePage/Sup62.svg';
import Sup71 from '../../../assets/References/SupplierCreatePage/Sup71.svg';
import Sup72 from '../../../assets/References/SupplierCreatePage/Sup72.svg';
import Sup81 from '../../../assets/References/SupplierCreatePage/Sup81.svg';
import Sup82 from '../../../assets/References/SupplierCreatePage/Sup82.svg';
import Sup91 from '../../../assets/References/SupplierCreatePage/Sup91.svg';
import Sup92 from '../../../assets/References/SupplierCreatePage/Sup92.svg';

const SupplierMainTab: React.FC<CommonSupplierProps> = (props) => {
  const {
    code, name = '', selectedCountry = '', selectedCountryId = '',
    address = '', selectedShortDescription = '', selectedShortDescriptionId = '',
    description = '', email = '', website = '', phone = '',
    selectedBrand = '', selectedBrandId = '',
    images = [], localImages = [],
  } = props;

  const [localSelectedIndex, setLocalSelectedIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  const labelStyle: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' };
  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' };
  const fieldH = 44; const GAP = 12; const TOP = 28; const COL_W = 340;
  
  const fieldBase = (w: number | string): React.CSSProperties => ({ 
    width: w, height: fieldH, borderRadius: 10, marginTop: 8, 
    display: 'flex', alignItems: 'center', paddingLeft: 13, paddingRight: 12, 
    boxSizing: 'border-box', backgroundColor: '#FFFFFF', position: 'relative',
    border: '1px solid rgba(102, 110, 254, 0.15)',
  });

  const filledBorder = '1px solid #666EFE';
  const emptyBorder = '1px solid rgba(102, 110, 254, 0.15)';

  const displayImages = (localImages && localImages.length > 0) ? localImages.map(img => ({ uid: img.url, url: img.url, originalName: img.file.name })) : images;
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); setLocalSelectedIndex((p: number) => p > 0 ? p - 1 : displayImages.length - 1); };
  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); setLocalSelectedIndex((p: number) => p < displayImages.length - 1 ? p + 1 : 0); };
  const cs: React.CSSProperties = { position: 'absolute', top: 164, left: 30, right: 30, bottom: 111 };
  const BLOCK_H = 565;

  return (
    <>
      <div style={{ ...cs, display: 'flex', gap: 30, pointerEvents: 'none' }}>
        {/* ЛЕВЫЙ БЛОК */}
        <div style={{ ...blockStyle, width: 792, height: BLOCK_H, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: TOP, left: 30, width: COL_W }}>
            <span style={labelStyle}>Код</span>
            <div style={{ ...fieldBase(COL_W), backgroundColor: '#F5F6FA' }}>
              <img src={Icon11} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ marginLeft: 10, color: '#666EFE', fontSize: 14 }}>{code || '—'}</span>
            </div>
            <div style={{ marginTop: GAP }}>
              <span style={labelStyle}>Страна</span>
              <div style={{ ...fieldBase(COL_W), border: selectedCountryId ? filledBorder : emptyBorder }}>
                <img src={selectedCountryId ? Sup22 : Sup21} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: selectedCountryId ? '#666EFE' : '#9CA3AF' }}>{selectedCountry || 'Выберите страну'}</span>
                <img src={selectedCountryId ? Icon42 : Icon41} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              </div>
            </div>
            <div style={{ marginTop: GAP }}>
              <span style={labelStyle}>Краткое описание</span>
              <div style={{ ...fieldBase(COL_W), border: selectedShortDescriptionId ? filledBorder : emptyBorder }}>
                <img src={selectedShortDescriptionId ? Sup32 : Sup31} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: selectedShortDescriptionId ? '#666EFE' : '#9CA3AF' }}>{selectedShortDescription || 'Выберите тип'}</span>
                <img src={selectedShortDescriptionId ? Icon42 : Icon41} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', top: TOP, right: 52, width: COL_W }}>
            <span style={labelStyle}>Наименование</span>
            <div style={{ ...fieldBase(COL_W), border: name.trim() ? filledBorder : emptyBorder }}>
              <img src={name.trim() ? Sup12 : Sup11} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: name.trim() ? '#666EFE' : '#A0A3BD', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || 'Введите название'}</span>
            </div>
            <div style={{ marginTop: GAP }}>
              <span style={labelStyle}>Адрес</span>
              <div style={{ ...fieldBase(COL_W), height: 100, alignItems: 'flex-start', paddingTop: 10, border: address.trim() ? filledBorder : emptyBorder }}>
                <img src={address.trim() ? Sup42 : Sup41} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <div style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: address.trim() ? '#666EFE' : '#A0A3BD', flex: 1, overflow: 'hidden', whiteSpace: 'pre-wrap' }}>{address || 'Введите адрес'}</div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', top: 278, left: 30, right: 30, bottom: 30 }}>
            <span style={labelStyle}>Описание</span>
            <div style={{ width: '100%', borderRadius: 10, border: description ? filledBorder : emptyBorder, backgroundColor: '#FFFFFF', marginTop: 8, height: 'calc(100% - 25px)', position: 'relative', paddingLeft: 13, paddingTop: 12, boxSizing: 'border-box' }}>
              <img src={description.trim() ? Icon52 : Icon51} alt="" style={{ position: 'absolute', top: 12, left: 13, width: 18, height: 18 }} />
              <div style={{ width: '100%', height: '100%', paddingLeft: 28, paddingRight: 12, paddingTop: 0, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: description ? '#666EFE' : '#A0A3BD', borderRadius: 10, boxSizing: 'border-box', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{description || 'Введите описание'}</div>
            </div>
          </div>
        </div>

        {/* СРЕДНИЙ БЛОК */}
        <div style={{ ...blockStyle, width: 475, height: BLOCK_H, flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: TOP, left: 30, right: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={Icon8} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ ...labelStyle, marginLeft: 9 }}>Email</span>
            </div>
            <div style={{ ...fieldBase('100%'), border: email.trim() ? filledBorder : emptyBorder }}>
              <img src={email.trim() ? Sup62 : Sup61} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: email.trim() ? '#666EFE' : '#A0A3BD', flex: 1 }}>{email || 'Введите email'}</span>
            </div>
            <div style={{ marginTop: 25, display: 'flex', alignItems: 'center' }}>
              <img src={Icon8} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ ...labelStyle, marginLeft: 9 }}>Сайт</span>
            </div>
            <div style={{ ...fieldBase('100%'), border: website.trim() ? filledBorder : emptyBorder }}>
              <img src={website.trim() ? Sup72 : Sup71} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: website.trim() ? '#666EFE' : '#A0A3BD', flex: 1 }}>{website || 'Введите сайт'}</span>
            </div>
            <div style={{ marginTop: 25, display: 'flex', alignItems: 'center' }}>
              <img src={Icon8} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ ...labelStyle, marginLeft: 9 }}>Телефон</span>
            </div>
            <div style={{ ...fieldBase('100%'), border: phone.trim() ? filledBorder : emptyBorder }}>
              <img src={phone.trim() ? Sup82 : Sup81} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: phone.trim() ? '#666EFE' : '#A0A3BD', flex: 1 }}>{phone || 'Введите телефон'}</span>
            </div>
            <div style={{ marginTop: 25, display: 'flex', alignItems: 'center' }}>
              <img src={Icon8} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ ...labelStyle, marginLeft: 9 }}>Бренд</span>
            </div>
            <div style={{ ...fieldBase('100%'), border: selectedBrandId ? filledBorder : emptyBorder }}>
              <img src={selectedBrandId ? Sup92 : Sup91} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: selectedBrandId ? '#666EFE' : '#9CA3AF' }}>{selectedBrand || 'Выберите бренд'}</span>
              <img src={selectedBrandId ? Icon42 : Icon41} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
            </div>
          </div>
        </div>

        {/* ПРАВЫЙ БЛОК */}
        <div style={{ ...blockStyle, width: 413, height: BLOCK_H, flexShrink: 0, position: 'relative', pointerEvents: 'auto' }}>
          <div style={{ position: 'absolute', top: 20, left: 30 }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' }}>Логотип</span></div>
          <div style={{ position: 'absolute', top: 49, left: 30, width: 353, height: 311, border: '1px solid rgba(230, 232, 248, 0.44)', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 351, height: 47, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(230, 232, 248, 0.44)', cursor: 'default', opacity: 0.4 }}><img src={Icon10} alt="" style={{ width: 21, height: 21 }} /></div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#FAFBFC' }}>
              {displayImages.length > 1 && <button onClick={prevImage} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 19, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, zIndex: 1 }}><img src={Icon101} alt="" style={{ width: 13, height: 19, transform: 'scaleX(-1)' }} /></button>}
              {displayImages.length > 0 ? (
                <div style={{ width: 231, height: 193, backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} onClick={() => setFullscreenImage(true)}><img src={displayImages[localSelectedIndex]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
              ) : <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9CA3AF' }}>Нет логотипа</span>}
              {displayImages.length > 1 && <button onClick={nextImage} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 19, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, zIndex: 1 }}><img src={Icon101} alt="" style={{ width: 13, height: 19 }} /></button>}
            </div>
            <div style={{ width: 351, height: 47, display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 6, borderTop: '1px solid rgba(230, 232, 248, 0.44)', overflowX: 'auto' }}>
              {displayImages.map((img, idx) => (<div key={idx} onClick={() => setLocalSelectedIndex(idx)} style={{ width: 43, height: 36, borderRadius: 4, border: idx === localSelectedIndex ? '2px solid #666EFE' : '2px solid transparent', flexShrink: 0, cursor: 'pointer', overflow: 'hidden', position: 'relative', backgroundColor: '#F5F6FA' }}><img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>))}
            </div>
          </div>
        </div>
      </div>

      {fullscreenImage && displayImages[localSelectedIndex]?.url && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setFullscreenImage(false)}>
          <img src={displayImages[localSelectedIndex].url} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
        </div>
      )}
    </>
  );
};

export default SupplierMainTab;