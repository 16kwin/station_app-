// StationMainTab.tsx — ПОЛНЫЙ ФАЙЛ (с использованием FormField)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { PopupType } from '../NomenclaturePage/CatalogSelectPopup';
import FormField from '../../elements/FormField';
import Icon8 from '../../../assets/References/NomenclatureCreatePage/Icon8.svg';
import Icon21 from '../../../assets/References/NomenclatureCreatePage/Icon21.svg';
import Icon22 from '../../../assets/References/NomenclatureCreatePage/Icon22.svg';
import Icon31 from '../../../assets/References/NomenclatureCreatePage/Icon31.svg';
import Icon32 from '../../../assets/References/NomenclatureCreatePage/Icon32.svg';

export interface StationMainTabProps {
  uid?: string; code: number; name: string;
  modelId: string; modelName: string;
  article: string; typeName: string; revision: string;
  serialNumber: string; productionDate: string;
  modelImageUrl: string;
  holdingId: number | null; holdingName: string;
  enterpriseId: number | null; enterpriseName: string;
  workshopId: number | null; workshopName: string;
  sectionId: number | null; sectionName: string;
  setHoldingId: (v: number | null) => void; setHoldingName: (v: string) => void;
  setEnterpriseId: (v: number | null) => void; setEnterpriseName: (v: string) => void;
  setWorkshopId: (v: number | null) => void; setWorkshopName: (v: string) => void;
  setSectionId: (v: number | null) => void; setSectionName: (v: string) => void;
  hasError: boolean; setHasError: (v: boolean) => void;
  isTmc: boolean; setIsTmc: (v: boolean) => void;
  isSgd: boolean; setIsSgd: (v: boolean) => void;
  isOk: boolean; setIsOk: (v: boolean) => void;
  isAdditionalModule: boolean; setIsAdditionalModule: (v: boolean) => void;
  hasAdditionalModule: boolean; setHasAdditionalModule: (v: boolean) => void;
  status: string; setStatus: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  ipAddress: string; setIpAddress: (v: string) => void;
  networkPort: number | ''; setNetworkPort: (v: number | '') => void;
  parentUid: string; setParentUid: (v: string) => void;
  setName: (v: string) => void;
  setSerialNumber: (v: string) => void;
  setProductionDate: (v: string) => void;
  openPopup: (type: PopupType, filter?: string) => void;
  onEnterpriseSelected?: (enterpriseId: number, enterpriseName: string) => void;
  isEdit: boolean;
  [key: string]: any;
}

const StationMainTab: React.FC<StationMainTabProps> = (props) => {
  const labelStyle: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' };
  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 15, border: '1px solid rgba(102, 110, 254, 0.15)', position: 'relative' };

  const FIELD_WIDTH = 340;
  const FIELD_HEIGHT = 44;
  const COL_GAP = 100;
  const ROW_GAP = 30;
  const START_LEFT = 40;
  const START_TOP = 30;

  const getColLeft = (col: number) => START_LEFT + col * (FIELD_WIDTH + COL_GAP);
  const getRowTop = (row: number) => START_TOP + row * (FIELD_HEIGHT + 11 + ROW_GAP + 14);

  const TOP_BLOCK_TOP = 165;
  const TOP_BLOCK_HEIGHT = 234;
  const TOP_BLOCK_WIDTH = 1740;
  const BOTTOM_BLOCK_TOP = TOP_BLOCK_TOP + TOP_BLOCK_HEIGHT + 30;
  const BOTTOM_BLOCK_HEIGHT = 300;

  const [centerMode, setCenterMode] = useState<'main' | 'placement' | 'accounting'>('main');

  const placementText = [props.holdingName, props.enterpriseName, props.workshopName, props.sectionName].filter(Boolean).join('; ') || 'Выберите размещение';

  const accountingItems = [
    { label: 'ТМЦ', value: props.isTmc, setter: () => props.setIsTmc(!props.isTmc) },
    { label: 'СГД', value: props.isSgd, setter: () => props.setIsSgd(!props.isSgd) },
    { label: 'ОК', value: props.isOk, setter: () => props.setIsOk(!props.isOk) },
    { label: 'Ошибка', value: props.hasError, setter: () => props.setHasError(!props.hasError) },
    { label: 'Доп. модуль', value: props.isAdditionalModule, setter: () => props.setIsAdditionalModule(!props.isAdditionalModule) },
    { label: 'Имеет доп. модуль', value: props.hasAdditionalModule, setter: () => props.setHasAdditionalModule(!props.hasAdditionalModule) },
  ];

  const accountingLabels = accountingItems.filter(item => item.value).map(item => item.label);
  const accountingText = accountingLabels.length > 0 ? accountingLabels.join(', ') : 'Выберите вид учёта';

  return (
    <>
      {/* ВЕРХНИЙ БЛОК */}
      <div style={{ position: 'absolute', top: TOP_BLOCK_TOP, left: 30, width: TOP_BLOCK_WIDTH, height: TOP_BLOCK_HEIGHT, ...blockStyle }}>
        <div style={{ position: 'absolute', top: getRowTop(0), left: getColLeft(0) }}>
          <FormField
            width={FIELD_WIDTH} height={FIELD_HEIGHT}
            label="Код:"
            value={String(props.code).padStart(4, '0')}
            type="display"
            locked
          />
        </div>
        <div style={{ position: 'absolute', top: getRowTop(0), left: getColLeft(1) }}>
          <FormField
            width={FIELD_WIDTH} height={FIELD_HEIGHT}
            label="Модель:"
            icon={Icon31} iconActive={Icon32}
            value={props.modelName}
            placeholder="Выберите модель"
            type="select"
            onClick={() => props.openPopup('stationModel')}
          />
        </div>
        <div style={{ position: 'absolute', top: getRowTop(0), left: getColLeft(2) }}>
          <FormField
            width={FIELD_WIDTH} height={FIELD_HEIGHT}
            label="Артикул:"
            value={props.article || '—'}
            type="display"
            locked
          />
        </div>
        <div style={{ position: 'absolute', top: getRowTop(0), left: getColLeft(3) }}>
          <FormField
            width={FIELD_WIDTH} height={FIELD_HEIGHT}
            label="Дата производства:"
            value={props.productionDate}
            type="input"
            inputType="date"
            onChange={e => props.setProductionDate(e.target.value)}
          />
        </div>
        <div style={{ position: 'absolute', top: getRowTop(1), left: getColLeft(0) }}>
          <FormField
            width={FIELD_WIDTH} height={FIELD_HEIGHT}
            label="Наименование:"
            icon={Icon21} iconActive={Icon22}
            value={props.name}
            placeholder="Введите название"
            type="input"
            onChange={e => props.setName(e.target.value)}
            onClear={() => props.setName('')}
          />
        </div>
        <div style={{ position: 'absolute', top: getRowTop(1), left: getColLeft(1) }}>
          <FormField
            width={FIELD_WIDTH} height={FIELD_HEIGHT}
            label="Тип:"
            value={props.typeName || '—'}
            type="display"
            locked
          />
        </div>
        <div style={{ position: 'absolute', top: getRowTop(1), left: getColLeft(2) }}>
          <FormField
            width={FIELD_WIDTH} height={FIELD_HEIGHT}
            label="Ревизия:"
            value={props.revision || '—'}
            type="display"
            locked
          />
        </div>
        <div style={{ position: 'absolute', top: getRowTop(1), left: getColLeft(3) }}>
          <FormField
            width={FIELD_WIDTH} height={FIELD_HEIGHT}
            label="Серийный номер:"
            value={props.serialNumber}
            placeholder="Введите серийный номер"
            type="input"
            onChange={e => props.setSerialNumber(e.target.value)}
            onClear={() => props.setSerialNumber('')}
          />
        </div>
      </div>

      {/* НИЖНИЕ ТРИ БЛОКА */}
      <div style={{ position: 'absolute', top: BOTTOM_BLOCK_TOP, left: 30, right: 30, height: BOTTOM_BLOCK_HEIGHT, display: 'flex', gap: 30 }}>
        {/* ЛЕВЫЙ — Изображение */}
        <div style={{ width: 300, height: BOTTOM_BLOCK_HEIGHT, ...blockStyle, padding: 0 }}>
          <div style={{ position: 'absolute', top: 30, left: 40 }}><span style={labelStyle}>Изображение:</span></div>
          <div style={{ position: 'absolute', top: 55, left: 40, width: 220, height: 220, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#F5F6FA', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {props.modelImageUrl ? <img src={props.modelImageUrl} alt="Модель" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9CA3AF' }}>Нет изображения</span>}
          </div>
        </div>

        {/* ЦЕНТРАЛЬНЫЙ — Размещение и вид учёта */}
        <div style={{ width: 536, height: BOTTOM_BLOCK_HEIGHT, ...blockStyle, overflow: 'hidden', position: 'relative' }}>
          {/* Главный экран */}
          <motion.div
            animate={{ x: centerMode === 'main' ? 0 : -536 }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, width: 536, height: '100%', padding: '25px 30px 0', boxSizing: 'border-box' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={Icon8} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ ...labelStyle, marginLeft: 9 }}>Размещение:</span>
            </div>
            <div onClick={() => setCenterMode('placement')} style={{ width: '100%', height: 44, borderRadius: 10, marginTop: 11, border: props.enterpriseId ? '1px solid #666EFE' : '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', paddingLeft: 14, paddingRight: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: props.enterpriseId ? '#666EFE' : '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
              {placementText}
            </div>
            <div style={{ marginTop: 25 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={Icon8} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ ...labelStyle, marginLeft: 9 }}>Вид учёта станции:</span>
              </div>
              <div onClick={() => setCenterMode('accounting')} style={{ width: '100%', height: 44, borderRadius: 10, marginTop: 11, border: accountingLabels.length > 0 ? '1px solid #666EFE' : '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', paddingLeft: 14, paddingRight: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: accountingLabels.length > 0 ? '#666EFE' : '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
                {accountingText}
              </div>
            </div>
          </motion.div>

          {/* Второй экран — меняет содержимое в зависимости от centerMode */}
          <motion.div
            animate={{ x: centerMode !== 'main' ? 0 : 536 }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, width: 536, height: '100%', padding: '25px 30px 0', boxSizing: 'border-box' }}
          >
            {centerMode === 'placement' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <button onClick={() => setCenterMode('main')} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="#2D4059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <span style={{ ...labelStyle }}>Размещение станции</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <FormField
                    width={476} height={44}
                    label="Предприятие"
                    icon={Icon31} iconActive={Icon32}
                    value={props.enterpriseName}
                    placeholder="Выберите предприятие"
                    type="select"
                    onClick={() => props.openPopup('enterprise')}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <FormField
                    width={476} height={44}
                    label="Цех"
                    icon={Icon31} iconActive={Icon32}
                    value={props.workshopName}
                    placeholder={props.enterpriseId ? 'Выберите цех' : 'Сначала выберите предприятие'}
                    type="select"
                    locked={!props.enterpriseId}
                    onClick={() => props.enterpriseId && props.openPopup('workshop', String(props.enterpriseId))}
                  />
                </div>
                <div>
                  <FormField
                    width={476} height={44}
                    label="Участок"
                    icon={Icon31} iconActive={Icon32}
                    value={props.sectionName}
                    placeholder={props.workshopId ? 'Выберите участок' : 'Сначала выберите цех'}
                    type="select"
                    locked={!props.workshopId}
                    onClick={() => props.workshopId && props.openPopup('section', String(props.workshopId))}
                  />
                </div>
              </>
            )}
            {centerMode === 'accounting' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <button onClick={() => setCenterMode('main')} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="#2D4059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <span style={{ ...labelStyle }}>Вид учёта станции</span>
                </div>
                <div style={{ border: '1px solid rgba(102, 110, 254, 0.15)', borderRadius: 10, overflow: 'hidden' }}>
                  {accountingItems.map(item => (
                    <div key={item.label} onClick={item.setter}
                      style={{ height: 44, display: 'flex', alignItems: 'center', paddingLeft: 14, paddingRight: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', backgroundColor: item.value ? '#F0F1FF' : '#FFFFFF', borderBottom: '1px solid rgba(102, 110, 254, 0.08)' }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, border: item.value ? 'none' : '2px solid rgba(45,64,89,0.3)', backgroundColor: item.value ? '#666EFE' : 'transparent', marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.value && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      {item.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* ПРАВЫЙ — Описание */}
        <div style={{ width: 844, height: BOTTOM_BLOCK_HEIGHT, ...blockStyle, padding: 0 }}>
          <div style={{ position: 'absolute', top: 30, left: 30 }}>
            <span style={labelStyle}>Описание:</span>
          </div>
          <div style={{
            position: 'absolute', top: 55, left: 30,
            width: 784, height: 212, borderRadius: 10,
            border: props.description ? '1px solid #666EFE' : '1px solid rgba(102, 110, 254, 0.15)',
            backgroundColor: '#FFFFFF',
          }}>
            <textarea
              style={{
                width: '100%', height: '100%', border: 'none', outline: 'none',
                padding: '15px 35px 15px 15px', fontFamily: 'Inter, sans-serif',
                fontSize: 14, fontWeight: 500,
                color: props.description ? '#666EFE' : '#A0A3BD',
                backgroundColor: 'transparent', resize: 'none',
                borderRadius: 10, boxSizing: 'border-box',
              }}
              value={props.description}
              onChange={e => props.setDescription(e.target.value)}
              placeholder="Введите описание станции"
            />
            {props.description && (
              <button
                onClick={() => props.setDescription('')}
                style={{ position: 'absolute', top: 15, right: 10, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8" fill="#666EFE" fillOpacity="0.15" />
                  <path d="M6 6L12 12M12 6L6 12" stroke="#666EFE" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StationMainTab;