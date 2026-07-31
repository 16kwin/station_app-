// SupplierRequisitesTab.tsx — read-only версия для клона (фуллскрин вынесен наружу)
import React, { useState } from 'react';
import type { CommonSupplierProps } from './SupplierCreatePage';
import Icon10 from '../../../assets/References/NomenclatureCreatePage/Icon10.svg';
import Icon101 from '../../../assets/References/NomenclatureCreatePage/Icon101.svg';
import Icon11 from '../../../assets/References/NomenclatureCreatePage/Icon11.svg';
import Icon12 from '../../../assets/References/NomenclatureCreatePage/Icon12.svg';
import Icon51 from '../../../assets/References/NomenclatureCreatePage/Icon51.svg';
import Icon52 from '../../../assets/References/NomenclatureCreatePage/Icon52.svg';
import Sup81 from '../../../assets/References/SupplierCreatePage/Sup81.svg';
import Sup82 from '../../../assets/References/SupplierCreatePage/Sup82.svg';
import Sup111 from '../../../assets/References/SupplierCreatePage/Sup111.svg';
import Sup112 from '../../../assets/References/SupplierCreatePage/Sup112.svg';
import Sup211 from '../../../assets/References/SupplierCreatePage/Sup121.svg';
import Sup212 from '../../../assets/References/SupplierCreatePage/Sup122.svg';
import Sup311 from '../../../assets/References/SupplierCreatePage/Sup131.svg';
import Sup312 from '../../../assets/References/SupplierCreatePage/Sup132.svg';
import Sup411 from '../../../assets/References/SupplierCreatePage/Sup141.svg';
import Sup412 from '../../../assets/References/SupplierCreatePage/Sup142.svg';
import Sup511 from '../../../assets/References/SupplierCreatePage/Sup151.svg';
import Sup512 from '../../../assets/References/SupplierCreatePage/Sup152.svg';

const SupplierRequisitesTab: React.FC<CommonSupplierProps> = (props) => {
  const {
    inn = '', ogrn = '', kpp = '', contactPerson = '', contactPosition = '', contactPhone = '',
    director = '', directorPosition = '', bankName = '', bik = '', correspondentAccount = '', settlementAccount = '',
    description = '', images = [], localImages = [],
  } = props;

  const [localSelectedIndex, setLocalSelectedIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  const labelStyle: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' };
  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' };
  const fieldH = 44; const TOP = 30; const ROW_GAP = 12; const COL_GAP = 52;
  const cs: React.CSSProperties = { position: 'absolute', top: 164, left: 30, right: 30, bottom: 111 };
  const BLOCK_H = 565;
  const filledBorder = '1px solid #666EFE';
  const emptyBorder = '1px solid rgba(102, 110, 254, 0.15)';

  const inputBaseStyle: React.CSSProperties = { 
    height: fieldH, borderRadius: 10, marginTop: 8, 
    display: 'flex', alignItems: 'center', paddingLeft: 13, paddingRight: 12, 
    boxSizing: 'border-box', backgroundColor: '#FFFFFF',
    border: emptyBorder,
  };

  const FieldRow = ({ 
    leftLabel, leftValue, leftPlaceholder, leftIconEmpty, leftIconFilled,
    rightLabel, rightValue, rightPlaceholder, rightIconEmpty, rightIconFilled 
  }: any) => (
    <div style={{ display: 'flex', gap: COL_GAP }}>
      <div style={{ flex: 1 }}>
        <span style={labelStyle}>{leftLabel}</span>
        <div style={{ ...inputBaseStyle, border: leftValue.trim() ? filledBorder : emptyBorder }}>
          <img src={leftValue.trim() ? leftIconFilled : leftIconEmpty} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: leftValue.trim() ? '#666EFE' : '#A0A3BD', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leftValue || leftPlaceholder}</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <span style={labelStyle}>{rightLabel}</span>
        <div style={{ ...inputBaseStyle, border: rightValue.trim() ? filledBorder : emptyBorder }}>
          <img src={rightValue.trim() ? rightIconFilled : rightIconEmpty} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: rightValue.trim() ? '#666EFE' : '#A0A3BD', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rightValue || rightPlaceholder}</span>
        </div>
      </div>
    </div>
  );

  const rowsHeight = (fieldH + 8 + 20) * 4 + ROW_GAP * 3;
  const displayImages = (localImages && localImages.length > 0) ? localImages.map(img => ({ uid: img.url, url: img.url, originalName: img.file.name })) : images;
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); setLocalSelectedIndex((p: number) => p > 0 ? p - 1 : displayImages.length - 1); };
  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); setLocalSelectedIndex((p: number) => p < displayImages.length - 1 ? p + 1 : 0); };

  return (
    <>
      <div style={{ ...cs, display: 'flex', gap: 30, pointerEvents: 'none' }}>
        <div style={{ ...blockStyle, width: 792, height: BLOCK_H, flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: TOP, left: 30, right: 30, bottom: 30 }}>
            <div>
              <FieldRow leftLabel="ИНН" leftValue={inn} leftPlaceholder="ИНН" leftIconEmpty={Icon11} leftIconFilled={Icon12} rightLabel="КПП" rightValue={kpp} rightPlaceholder="КПП" rightIconEmpty={Icon11} rightIconFilled={Icon12} />
              <div style={{ marginTop: ROW_GAP }}>
                <FieldRow leftLabel="ОГРН" leftValue={ogrn} leftPlaceholder="ОГРН" leftIconEmpty={Icon11} leftIconFilled={Icon12} rightLabel="Контактное лицо" rightValue={contactPerson} rightPlaceholder="ФИО" rightIconEmpty={Sup111} rightIconFilled={Sup112} />
              </div>
              <div style={{ marginTop: ROW_GAP }}>
                <FieldRow leftLabel="Руководитель" leftValue={director} leftPlaceholder="ФИО" leftIconEmpty={Sup111} leftIconFilled={Sup112} rightLabel="Должность конт. лица" rightValue={contactPosition} rightPlaceholder="Должность" rightIconEmpty={Sup211} rightIconFilled={Sup212} />
              </div>
              <div style={{ marginTop: ROW_GAP }}>
                <FieldRow leftLabel="Должность руководителя" leftValue={directorPosition} leftPlaceholder="Должность" leftIconEmpty={Sup211} leftIconFilled={Sup212} rightLabel="Телефон конт. лица" rightValue={contactPhone} rightPlaceholder="Телефон" rightIconEmpty={Sup81} rightIconFilled={Sup82} />
              </div>
            </div>
            <div style={{ position: 'absolute', top: rowsHeight + 30, left: 0, right: 0, bottom: 0 }}>
              <span style={labelStyle}>Описание</span>
              <div style={{ width: '100%', borderRadius: 10, border: description ? filledBorder : emptyBorder, backgroundColor: '#FFFFFF', marginTop: 8, height: 'calc(100% - 25px)', position: 'relative', paddingLeft: 13, paddingTop: 12, boxSizing: 'border-box' }}>
                <img src={description.trim() ? Icon52 : Icon51} alt="" style={{ position: 'absolute', top: 12, left: 13, width: 18, height: 18 }} />
                <div style={{ width: '100%', height: '100%', paddingLeft: 28, paddingRight: 12, paddingTop: 0, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: description ? '#666EFE' : '#A0A3BD', borderRadius: 10, boxSizing: 'border-box', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{description || 'Введите описание'}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...blockStyle, width: 475, height: BLOCK_H, flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: TOP, left: 30, right: 30, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><span style={labelStyle}>Банк</span>
              <div style={{ ...inputBaseStyle, border: bankName.trim() ? filledBorder : emptyBorder }}>
                <img src={bankName.trim() ? Sup312 : Sup311} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: bankName.trim() ? '#666EFE' : '#A0A3BD', flex: 1 }}>{bankName || 'Наименование банка'}</span>
              </div>
            </div>
            <div><span style={labelStyle}>БИК</span>
              <div style={{ ...inputBaseStyle, border: bik.trim() ? filledBorder : emptyBorder }}>
                <img src={bik.trim() ? Icon12 : Icon11} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: bik.trim() ? '#666EFE' : '#A0A3BD', flex: 1 }}>{bik || 'БИК'}</span>
              </div>
            </div>
            <div><span style={labelStyle}>Корреспондентский счет</span>
              <div style={{ ...inputBaseStyle, border: correspondentAccount.trim() ? filledBorder : emptyBorder }}>
                <img src={correspondentAccount.trim() ? Sup412 : Sup411} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: correspondentAccount.trim() ? '#666EFE' : '#A0A3BD', flex: 1 }}>{correspondentAccount || 'Корр. счет'}</span>
              </div>
            </div>
            <div><span style={labelStyle}>Расчетный счет</span>
              <div style={{ ...inputBaseStyle, border: settlementAccount.trim() ? filledBorder : emptyBorder }}>
                <img src={settlementAccount.trim() ? Sup512 : Sup511} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ marginLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: settlementAccount.trim() ? '#666EFE' : '#A0A3BD', flex: 1 }}>{settlementAccount || 'Расч. счет'}</span>
              </div>
            </div>
          </div>
        </div>

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

export default SupplierRequisitesTab;