// StationsPage.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StationCell from './StationCell';
import StationRow from './StationRow';
import SchablonPopup from './SchablonPopup';
import ConstantInfo from '../../info/ConstantInfo';
import AxiosService from '../../services/AxiosService';
import CustomScrollbar from '../../components/CustomScrollbar';

import Icon1 from '../../assets/Station/1.svg';
import Icon2 from '../../assets/Station/2.svg';
import Icon3 from '../../assets/Station/3.svg';
import Icon4 from '../../assets/Station/4.svg';
import Icon5 from '../../assets/Station/5.svg';
import Icon6 from '../../assets/Station/6.svg';
import Icon7 from '../../assets/Station/7.svg';
import Icon8 from '../../assets/Station/8.svg';
import Icon9 from '../../assets/Station/9.svg';
import Icon10 from '../../assets/Station/10.svg';
import Icon11 from '../../assets/Station/11.svg';
import Icon12 from '../../assets/Station/12.svg';
import type { JSX } from 'react/jsx-runtime';

interface Holding {
  id: number;
  name: string;
  enterprises: Enterprise[];
}

interface Enterprise {
  id: number;
  name: string;
  holdingId: number;
  workshops: Workshop[];
}

interface Workshop {
  id: number;
  name: string;
  enterpriseId: number;
  holdingId: number;
  sections: Section[];
}

interface Section {
  id: number;
  name: string;
  workshopId: number;
  enterpriseId: number;
  holdingId: number;
}

interface HierarchyDTO {
  holdings: Holding[];
}

interface StationStatic {
  uid: string;
  name: string;
  workshop: string;
  section: string;
  enterpriseId: number;
  workshopId: number;
  sectionId: number;
  holdingId: number;
  status: string;
  stationType: string;
  parentUid: string | null;
  hasError: boolean;
  isTmc: boolean;
  isSgd: boolean;
  isOk: boolean;
  configurationUid?: string;
}

interface StationDynamic {
  uid: string;
  filledCellsPercent: number;
  remainingNomenclaturePercent: number;
  readyPartsPercent: number;
  totalCells: number;
  filledCells: number;
  templateNomenclatureCount: number;
  remainingNomenclatureCount: number;
  maxReadyParts: number;
  readyPartsCount: number;
}

interface UserFilterDTO {
  searchQuery: string;
  sortOption: string | null;
  selectedHoldings: number[];
  selectedEnterprises: number[];
  selectedWorkshops: number[];
  selectedSections: number[];
  selectedStatuses: string[];
  selectedTypes: string[];
  selectedTypeUids: string[];
  selectedModelUids: string[];
  overissue: boolean | null;
  hasError: boolean | null;
  isTmc: boolean | null;
  isSgd: boolean | null;
  minOstatok: boolean;
  criticalOstatok: boolean;
  viewMode: string;
}

type ViewMode = 'grid' | 'list';
type FilterSubmenuType = 'placement' | 'status' | 'type' | 'overissue' | 'error' | null;

interface FilterCascadeState {
  activeType: FilterSubmenuType;
  activeItemIndex: number;
}

const sortOptionToBackend: Record<string, string> = {
  'nameAsc': 'NAME_ASC',
  'nameDesc': 'NAME_DESC',
  'placementAsc': 'PLACEMENT',
  'statusDesc': 'STATUS',
  'tmcSgd': 'TYPE_PRIORITY',
};

const backendToSortOption: Record<string, string> = {
  'NAME_ASC': 'nameAsc',
  'NAME_DESC': 'nameDesc',
  'PLACEMENT': 'placementAsc',
  'STATUS': 'statusDesc',
  'TYPE_PRIORITY': 'tmcSgd',
};

const statusMapping: Record<string, string> = {
  'В работе': 'WORKING',
  'Не в сети': 'OFFLINE',
  'Минимальный остаток': 'MINIMAL_STOCK',
  'Критический остаток': 'CRITICAL_STOCK',
};

const reverseStatusMapping: Record<string, string> = {
  'WORKING': 'В работе',
  'OFFLINE': 'Не в сети',
  'MINIMAL_STOCK': 'Минимальный остаток',
  'CRITICAL_STOCK': 'Критический остаток',
};

const SCROLL_AREA_HEIGHT = 640;
const HEADER_HEIGHT = 36;
const CONTROLS_HEIGHT = 74;
const BASE_GAP_TOP = 35;
const BASE_GAP_TITLE_TO_CONTROLS = 20;
const BASE_GAP_CONTROLS_TO_SCROLL = 30;
const BASE_GAP_BOTTOM = 30;
const BASE_GAPS_SUM = BASE_GAP_TOP + BASE_GAP_TITLE_TO_CONTROLS + BASE_GAP_CONTROLS_TO_SCROLL + BASE_GAP_BOTTOM;

const STORAGE_KEY = 'stationsPageState';

const loadSavedState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load saved state:', e);
  }
  return null;
};

const StationsPage = () => {
  const savedState = loadSavedState();

  const expandedRef = useRef<HTMLDivElement | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement | null>(null);
  const ostatokDropdownRef = useRef<HTMLDivElement | null>(null);
  const holdingDropdownRef = useRef<HTMLDivElement | null>(null);
  const enterpriseDropdownRef = useRef<HTMLDivElement | null>(null);
  const workshopDropdownRef = useRef<HTMLDivElement | null>(null);
  const sectionDropdownRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRowRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scaleWarningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [activeButtons, setActiveButtons] = useState<number[]>(savedState?.activeButtons || [9]);
  const [expandedButton, setExpandedButton] = useState<number | null>(null);
  const [stationsStatic, setStationsStatic] = useState<StationStatic[]>([]);
  const [stationsDynamic, setStationsDynamic] = useState<Map<string, StationDynamic>>(new Map());
  const [loading, setLoading] = useState(true);
  const [stationsError, setStationsError] = useState<string | null>(null);

  const [hierarchy, setHierarchy] = useState<HierarchyDTO | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>(savedState?.viewMode || 'grid');
  const [sortOption, setSortOption] = useState<string>(savedState?.sortOption || '');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [hasSortSelection, setHasSortSelection] = useState(savedState?.hasSortSelection || false);

  const [searchQuery, setSearchQuery] = useState(savedState?.searchQuery || '');
  const [hasSearchQuery, setHasSearchQuery] = useState(savedState?.hasSearchQuery || false);

  const [showOstatokDropdown, setShowOstatokDropdown] = useState(false);
  const [showHoldingDropdown, setShowHoldingDropdown] = useState(false);
  const [showEnterpriseDropdown, setShowEnterpriseDropdown] = useState(false);
  const [showWorkshopDropdown, setShowWorkshopDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);

  const [selectedHoldings, setSelectedHoldings] = useState<number[]>(savedState?.selectedHoldings || []);
  const [selectedEnterprises, setSelectedEnterprises] = useState<number[]>(savedState?.selectedEnterprises || []);
  const [selectedWorkshops, setSelectedWorkshops] = useState<number[]>(savedState?.selectedWorkshops || []);
  const [selectedSections, setSelectedSections] = useState<number[]>(savedState?.selectedSections || []);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(savedState?.selectedStatuses || []);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(savedState?.selectedTypes || []);
  const [selectedOverissue, setSelectedOverissue] = useState<string | null>(savedState?.selectedOverissue || null);
  const [selectedError, setSelectedError] = useState<string | null>(savedState?.selectedError || null);

  const [backendFiltersLoaded, setBackendFiltersLoaded] = useState(false);

  const [filterCascade, setFilterCascade] = useState<FilterCascadeState>({
    activeType: null,
    activeItemIndex: 0,
  });

  const [adaptiveGaps, setAdaptiveGaps] = useState({
    topPadding: BASE_GAP_TOP,
    controlsMarginTop: BASE_GAP_TITLE_TO_CONTROLS,
    scrollMarginTop: BASE_GAP_CONTROLS_TO_SCROLL,
    bottomPadding: BASE_GAP_BOTTOM,
  });

  const [isScaleTooLarge, setIsScaleTooLarge] = useState(false);
  const [showScaleWarning, setShowScaleWarning] = useState(false);

  const [schablonPopupData, setSchablonPopupData] = useState<{
    isOpen: boolean;
    uid?: string;
    name?: string;
    workshop?: string;
    section?: string;
    status?: string;
    configurationUid?: string;
  }>({ isOpen: false });

  const isTmcEnabled = selectedTypes.includes('ТМЦ');
  const isSgdEnabled = selectedTypes.includes('СГД');
  const minOstatokEnabled = selectedStatuses.includes('Минимальный остаток');
  const criticalOstatokEnabled = selectedStatuses.includes('Критический остаток');
  const isOstatokActive = minOstatokEnabled || criticalOstatokEnabled;
  const isHoldingActive = selectedHoldings.length > 0;
  const isEnterpriseActive = selectedEnterprises.length > 0;
  const isWorkshopActive = selectedWorkshops.length > 0;
  const isSectionActive = selectedSections.length > 0;
  const isFilterActive = selectedHoldings.length > 0 || selectedEnterprises.length > 0 || selectedWorkshops.length > 0 ||
    selectedSections.length > 0 || selectedStatuses.length > 0 ||
    selectedTypes.length > 0 || selectedOverissue !== null || selectedError !== null;

  const buildFilterDTO = useCallback((): UserFilterDTO => {
    return {
      searchQuery,
      sortOption: hasSortSelection && sortOption ? sortOptionToBackend[sortOption] || null : null,
      selectedHoldings,
      selectedEnterprises,
      selectedWorkshops,
      selectedSections,
      selectedStatuses: selectedStatuses.map(s => statusMapping[s]).filter(Boolean),
      selectedTypes: [],
      selectedTypeUids: [],
      selectedModelUids: [],
      overissue: selectedOverissue === 'Да' ? true : selectedOverissue === 'Нет' ? false : null,
      hasError: selectedError === 'Да' ? true : selectedError === 'Нет' ? false : null,
      isTmc: isTmcEnabled || null,
      isSgd: isSgdEnabled || null,
      minOstatok: minOstatokEnabled,
      criticalOstatok: criticalOstatokEnabled,
      viewMode,
    };
  }, [
    searchQuery, hasSortSelection, sortOption, selectedHoldings, selectedEnterprises, selectedWorkshops,
    selectedSections, selectedStatuses, selectedOverissue, selectedError,
    isTmcEnabled, isSgdEnabled, minOstatokEnabled, criticalOstatokEnabled, viewMode,
  ]);

  const fetchFilteredStations = useCallback(async () => {
    try {
      if (!window.config || !window.config.ip_api) {
        setStationsError('Не удалось определить адрес сервера');
        setLoading(false);
        return;
      }
      const filters = buildFilterDTO();
      const [staticRes, dynamicRes] = await Promise.all([
        AxiosService.post(ConstantInfo.restApiStationsStaticFiltered, filters),
        AxiosService.post(ConstantInfo.restApiStationsDynamicFiltered, filters)
      ]);
      setStationsStatic(staticRes.data || []);
      const dynamicMap = new Map();
      if (dynamicRes.data && Array.isArray(dynamicRes.data)) {
        dynamicRes.data.forEach((d: StationDynamic) => dynamicMap.set(d.uid, d));
      }
      setStationsDynamic(dynamicMap);
      setStationsError(null);
    } catch (error) {
      console.error('Ошибка загрузки станций:', error);
      setStationsError('Не удалось загрузить данные станций');
    } finally {
      setLoading(false);
    }
  }, [buildFilterDTO]);

  const debouncedFetch = useCallback(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => { fetchFilteredStations(); }, 300);
  }, [fetchFilteredStations]);

  const handleOpenSchablonPopup = (station: StationStatic) => {
    setSchablonPopupData({
      isOpen: true,
      uid: station.uid,
      name: station.name,
      workshop: station.workshop,
      section: station.section,
      status: station.status,
      configurationUid: station.configurationUid,
    });
  };

  const handleCloseSchablonPopup = () => {
    setSchablonPopupData({ isOpen: false });
    fetchFilteredStations();
  };

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const response = await AxiosService.get(ConstantInfo.restApiLocationHierarchy);
        const data: HierarchyDTO = response.data;
        setHierarchy(data);
        setHoldings(data.holdings || []);
        const allEnterprises: Enterprise[] = [];
        const allWorkshops: Workshop[] = [];
        const allSections: Section[] = [];
        (data.holdings || []).forEach(holding => {
          (holding.enterprises || []).forEach(enterprise => {
            allEnterprises.push({ ...enterprise, holdingId: holding.id });
            (enterprise.workshops || []).forEach(workshop => {
              allWorkshops.push({ ...workshop, enterpriseId: enterprise.id, holdingId: holding.id });
              (workshop.sections || []).forEach(section => {
                allSections.push({ ...section, workshopId: workshop.id, enterpriseId: enterprise.id, holdingId: holding.id });
              });
            });
          });
        });
        setEnterprises(allEnterprises);
        setWorkshops(allWorkshops);
        setSections(allSections);
      } catch (error) {
        console.error('Ошибка загрузки иерархии:', error);
      }
    };
    fetchHierarchy();
  }, []);

  useEffect(() => {
    const fetchUserFilters = async () => {
      try {
        const response = await AxiosService.get(ConstantInfo.restApiUserFilters);
        const filters: any = response.data;
        if (filters.selectedHoldings) setSelectedHoldings(filters.selectedHoldings);
        if (filters.selectedEnterprises) setSelectedEnterprises(filters.selectedEnterprises);
        if (filters.selectedWorkshops) setSelectedWorkshops(filters.selectedWorkshops);
        if (filters.selectedSections) setSelectedSections(filters.selectedSections);
        if (filters.selectedStatuses) {
          setSelectedStatuses(filters.selectedStatuses.map((s: string) => reverseStatusMapping[s] || s));
        }
        if (filters.isTmc) setSelectedTypes(prev => prev.includes('ТМЦ') ? prev : [...prev, 'ТМЦ']);
        if (filters.isSgd) setSelectedTypes(prev => prev.includes('СГД') ? prev : [...prev, 'СГД']);
        if (filters.overissue !== undefined && filters.overissue !== null) {
          setSelectedOverissue(filters.overissue === true ? 'Да' : filters.overissue === false ? 'Нет' : null);
        }
        if (filters.hasError !== undefined && filters.hasError !== null) {
          setSelectedError(filters.hasError === true ? 'Да' : filters.hasError === false ? 'Нет' : null);
        }
        if (filters.sortOption) {
          const frontSort = backendToSortOption[filters.sortOption] || '';
          setSortOption(frontSort);
          setHasSortSelection(!!frontSort);
        }
        if (filters.viewMode) {
          setViewMode(filters.viewMode as ViewMode);
          setActiveButtons(prev => { const filtered = prev.filter(i => i !== 9 && i !== 10); return [...filtered, filters.viewMode === 'grid' ? 9 : 10]; });
        }
        if (filters.searchQuery) { setSearchQuery(filters.searchQuery); setHasSearchQuery(true); }
      } catch (error) {
        console.error('Ошибка загрузки фильтров:', error);
      } finally {
        setBackendFiltersLoaded(true);
      }
    };
    fetchUserFilters();
  }, []);

  const saveUserFilters = useCallback(async () => {
    if (!hierarchy || !backendFiltersLoaded) return;
    const filters = buildFilterDTO();
    try {
      await AxiosService.post(ConstantInfo.restApiUserFilters, filters);
    } catch (error) {
      console.error('Ошибка сохранения фильтров:', error);
    }
  }, [buildFilterDTO, hierarchy, backendFiltersLoaded]);

  useEffect(() => { saveUserFilters(); }, [saveUserFilters]);

  useEffect(() => {
    if (!hierarchy) return;
    setLoading(true);
    fetchFilteredStations();
  }, [
    selectedHoldings, selectedEnterprises, selectedWorkshops, selectedSections, selectedStatuses,
    selectedTypes, selectedOverissue, selectedError, sortOption, hasSortSelection,
    fetchFilteredStations, hierarchy,
  ]);

  useEffect(() => {
    if (!hierarchy) return;
    setLoading(true);
    debouncedFetch();
    return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
  }, [searchQuery, debouncedFetch, hierarchy]);

  useEffect(() => {
    if (expandedButton === 0 && searchInputRef.current) {
      setTimeout(() => { searchInputRef.current?.focus(); }, 400);
    }
  }, [expandedButton]);

  useEffect(() => {
    const checkScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const baseWidth = 1920;
      const baseHeight = 1080;
      const widthScale = width / baseWidth;
      const heightScale = height / baseHeight;
      const maxScale = Math.max(widthScale, heightScale);
      if (maxScale > 1.5) {
        setIsScaleTooLarge(true);
        setShowScaleWarning(true);
        if (scaleWarningTimerRef.current) clearTimeout(scaleWarningTimerRef.current);
        scaleWarningTimerRef.current = setTimeout(() => setShowScaleWarning(false), 2000);
      } else {
        setIsScaleTooLarge(false);
        setShowScaleWarning(false);
      }
    };
    checkScale();
    window.addEventListener('resize', checkScale);
    return () => {
      window.removeEventListener('resize', checkScale);
      if (scaleWarningTimerRef.current) clearTimeout(scaleWarningTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const stateToSave = {
      activeButtons, viewMode, sortOption, hasSortSelection, searchQuery,
      hasSearchQuery, selectedHoldings, selectedEnterprises, selectedWorkshops, selectedSections,
      selectedStatuses, selectedTypes, selectedOverissue, selectedError,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    activeButtons, viewMode, sortOption, hasSortSelection, searchQuery,
    hasSearchQuery, selectedHoldings, selectedEnterprises, selectedWorkshops, selectedSections,
    selectedStatuses, selectedTypes, selectedOverissue, selectedError,
  ]);

  useEffect(() => {
    setExpandedButton(null);
    setShowSortDropdown(false);
    setShowFilterDropdown(false);
    setShowOstatokDropdown(false);
    setShowHoldingDropdown(false);
    setShowEnterpriseDropdown(false);
    setShowWorkshopDropdown(false);
    setShowSectionDropdown(false);
  }, []);

  useEffect(() => {
    const gridButton = 9;
    const listButton = 10;
    setActiveButtons(prev => {
      const withoutViewButtons = prev.filter(i => i !== gridButton && i !== listButton);
      return [...withoutViewButtons, viewMode === 'grid' ? gridButton : listButton];
    });
  }, [viewMode]);

  useEffect(() => {
    if (isHoldingActive && !activeButtons.includes(11)) setActiveButtons(prev => [...prev, 11]);
    else if (!isHoldingActive && activeButtons.includes(11) && expandedButton !== 11) setActiveButtons(prev => prev.filter(i => i !== 11));
  }, [isHoldingActive]);

  useEffect(() => {
    if (isEnterpriseActive && !activeButtons.includes(3)) setActiveButtons(prev => [...prev, 3]);
    else if (!isEnterpriseActive && activeButtons.includes(3) && expandedButton !== 3) setActiveButtons(prev => prev.filter(i => i !== 3));
  }, [isEnterpriseActive]);

  useEffect(() => {
    if (isWorkshopActive && !activeButtons.includes(4)) setActiveButtons(prev => [...prev, 4]);
    else if (!isWorkshopActive && activeButtons.includes(4) && expandedButton !== 4) setActiveButtons(prev => prev.filter(i => i !== 4));
  }, [isWorkshopActive]);

  useEffect(() => {
    if (isSectionActive && !activeButtons.includes(5)) setActiveButtons(prev => [...prev, 5]);
    else if (!isSectionActive && activeButtons.includes(5) && expandedButton !== 5) setActiveButtons(prev => prev.filter(i => i !== 5));
  }, [isSectionActive]);

  useEffect(() => {
    if (hasSearchQuery && !activeButtons.includes(0)) setActiveButtons(prev => [...prev, 0]);
    else if (!hasSearchQuery && activeButtons.includes(0) && expandedButton !== 0) setActiveButtons(prev => prev.filter(i => i !== 0));
  }, [hasSearchQuery]);

  useEffect(() => {
    if (hasSortSelection && !activeButtons.includes(1)) setActiveButtons(prev => [...prev, 1]);
    else if (!hasSortSelection && activeButtons.includes(1) && expandedButton !== 1) setActiveButtons(prev => prev.filter(i => i !== 1));
  }, [hasSortSelection]);

  useEffect(() => {
    if (isFilterActive && !activeButtons.includes(2)) setActiveButtons(prev => [...prev, 2]);
    else if (!isFilterActive && activeButtons.includes(2) && expandedButton !== 2) setActiveButtons(prev => prev.filter(i => i !== 2));
  }, [isFilterActive]);

  useEffect(() => {
    if (isOstatokActive && !activeButtons.includes(8)) setActiveButtons(prev => [...prev, 8]);
    else if (!isOstatokActive && activeButtons.includes(8) && expandedButton !== 8) setActiveButtons(prev => prev.filter(i => i !== 8));
  }, [isOstatokActive]);

  useEffect(() => {
    if (isTmcEnabled && !activeButtons.includes(6)) setActiveButtons(prev => [...prev, 6]);
    else if (!isTmcEnabled && activeButtons.includes(6)) setActiveButtons(prev => prev.filter(i => i !== 6));
  }, [isTmcEnabled]);

  useEffect(() => {
    if (isSgdEnabled && !activeButtons.includes(7)) setActiveButtons(prev => [...prev, 7]);
    else if (!isSgdEnabled && activeButtons.includes(7)) setActiveButtons(prev => prev.filter(i => i !== 7));
  }, [isSgdEnabled]);

  useEffect(() => {
    const calculateAdaptiveGaps = () => {
      if (!containerRef.current) return;
      const whiteBlock = containerRef.current.closest('.white-block');
      if (!whiteBlock) return;
      const whiteBlockHeight = whiteBlock.clientHeight;
      const fixedHeight = HEADER_HEIGHT + CONTROLS_HEIGHT + SCROLL_AREA_HEIGHT;
      const availableGapSpace = whiteBlockHeight - fixedHeight;
      const scale = availableGapSpace / BASE_GAPS_SUM;
      setAdaptiveGaps({
        topPadding: Math.max(5, Math.round(BASE_GAP_TOP * scale)),
        controlsMarginTop: Math.max(5, Math.round(BASE_GAP_TITLE_TO_CONTROLS * scale)),
        scrollMarginTop: Math.max(5, Math.round(BASE_GAP_CONTROLS_TO_SCROLL * scale)),
        bottomPadding: Math.max(5, Math.round(BASE_GAP_BOTTOM * scale)),
      });
    };
    calculateAdaptiveGaps();
    const resizeObserver = new ResizeObserver(calculateAdaptiveGaps);
    if (containerRef.current) {
      const whiteBlock = containerRef.current.closest('.white-block');
      if (whiteBlock) resizeObserver.observe(whiteBlock);
    }
    window.addEventListener('resize', calculateAdaptiveGaps);
    return () => { resizeObserver.disconnect(); window.removeEventListener('resize', calculateAdaptiveGaps); };
  }, []);

  useEffect(() => {
    if (!window.config || !window.config.ip_api) return;
    const host = window.config.ip_api.replace('http://', '').replace('https://', '');
    const wsUrl = `ws://${host}:${ConstantInfo.serverPort}/ws-stations`;
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => console.log('WebSocket connected');
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data) && data.length > 0 && 'name' in data[0]) setStationsStatic(data);
          if (Array.isArray(data) && data.length > 0 && 'filledCellsPercent' in data[0]) {
            const dynamicMap = new Map();
            data.forEach((d: StationDynamic) => dynamicMap.set(d.uid, d));
            setStationsDynamic(dynamicMap);
          }
          if (data?.uid && 'filledCellsPercent' in data) setStationsDynamic(prev => new Map(prev).set(data.uid, data));
          if (data?.uid && 'name' in data) {
            setStationsStatic(prev => {
              const index = prev.findIndex(s => s.uid === data.uid);
              if (index !== -1) { const ns = [...prev]; ns[index] = data; return ns; }
              return [...prev, data];
            });
          }
        } catch (e) { console.error('WebSocket parse error:', e); }
      };
      socket.onerror = (error) => console.error('WebSocket error:', error);
    } catch (error) { console.error('WebSocket connection error:', error); }
    return () => { if (socket?.readyState === WebSocket.OPEN) socket.close(); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
        if (expandedButton !== null) closeExpanded();
        return;
      }
      if (expandedButton === null) {
        if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) setShowSortDropdown(false);
        if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
          setShowFilterDropdown(false);
          setFilterCascade(prev => ({ ...prev, activeType: null, activeItemIndex: 0 }));
        }
        if (ostatokDropdownRef.current && !ostatokDropdownRef.current.contains(event.target as Node)) setShowOstatokDropdown(false);
        if (holdingDropdownRef.current && !holdingDropdownRef.current.contains(event.target as Node)) setShowHoldingDropdown(false);
        if (enterpriseDropdownRef.current && !enterpriseDropdownRef.current.contains(event.target as Node)) setShowEnterpriseDropdown(false);
        if (workshopDropdownRef.current && !workshopDropdownRef.current.contains(event.target as Node)) setShowWorkshopDropdown(false);
        if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(event.target as Node)) setShowSectionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedButton]);

  useEffect(() => {
    if (selectedHoldings.length > 0) {
      const validEnterpriseIds = enterprises.filter(e => selectedHoldings.includes(e.holdingId)).map(e => e.id);
      setSelectedEnterprises(prev => prev.filter(id => validEnterpriseIds.includes(id)));
      const validWorkshopIds = workshops.filter(w => validEnterpriseIds.includes(w.enterpriseId)).map(w => w.id);
      setSelectedWorkshops(prev => prev.filter(id => validWorkshopIds.includes(id)));
      const validSectionIds = sections.filter(s => validWorkshopIds.includes(s.workshopId)).map(s => s.id);
      setSelectedSections(prev => prev.filter(id => validSectionIds.includes(id)));
    }
  }, [selectedHoldings]);

  useEffect(() => {
    if (selectedEnterprises.length > 0) {
      const validWorkshopIds = workshops.filter(w => selectedEnterprises.includes(w.enterpriseId)).map(w => w.id);
      setSelectedWorkshops(prev => prev.filter(id => validWorkshopIds.includes(id)));
      const validSectionIds = sections.filter(s => validWorkshopIds.includes(s.workshopId)).map(s => s.id);
      setSelectedSections(prev => prev.filter(id => validSectionIds.includes(id)));
    }
  }, [selectedEnterprises]);

  useEffect(() => {
    if (selectedWorkshops.length > 0) {
      const validSectionIds = sections.filter(s => selectedWorkshops.includes(s.workshopId)).map(s => s.id);
      setSelectedSections(prev => prev.filter(id => validSectionIds.includes(id)));
    }
  }, [selectedWorkshops]);

  const getFilterHoldings = (): Holding[] => {
    if (selectedHoldings.length > 0) return holdings.filter(h => selectedHoldings.includes(h.id));
    return holdings;
  };

  const getFilterEnterprises = (): Enterprise[] => {
    if (selectedHoldings.length > 0) {
      return enterprises.filter(e => selectedHoldings.includes(e.holdingId));
    }
    if (selectedEnterprises.length > 0) {
      return enterprises.filter(e => selectedEnterprises.includes(e.id));
    }
    return enterprises;
  };

  const getFilterWorkshops = (): Workshop[] => {
    if (selectedEnterprises.length > 0) {
      const validEnterpriseIds = new Set(selectedEnterprises);
      return workshops.filter(w => validEnterpriseIds.has(w.enterpriseId));
    }
    if (selectedWorkshops.length > 0) {
      return workshops.filter(w => selectedWorkshops.includes(w.id));
    }
    if (selectedHoldings.length > 0) {
      const validEnterpriseIds = new Set(enterprises.filter(e => selectedHoldings.includes(e.holdingId)).map(e => e.id));
      return workshops.filter(w => validEnterpriseIds.has(w.enterpriseId));
    }
    return workshops;
  };

  const getFilterSections = (): Section[] => {
    if (selectedWorkshops.length > 0) {
      const validWorkshopIds = new Set(selectedWorkshops);
      return sections.filter(s => validWorkshopIds.has(s.workshopId));
    }
    if (selectedSections.length > 0) {
      return sections.filter(s => selectedSections.includes(s.id));
    }
    if (selectedEnterprises.length > 0) {
      const validWorkshopIds = new Set(workshops.filter(w => selectedEnterprises.includes(w.enterpriseId)).map(w => w.id));
      return sections.filter(s => validWorkshopIds.has(s.workshopId));
    }
    if (selectedHoldings.length > 0) {
      const validEnterpriseIds = new Set(enterprises.filter(e => selectedHoldings.includes(e.holdingId)).map(e => e.id));
      const validWorkshopIds = new Set(workshops.filter(w => validEnterpriseIds.has(w.enterpriseId)).map(w => w.id));
      return sections.filter(s => validWorkshopIds.has(s.workshopId));
    }
    return sections;
  };

  const shouldShowFilterEnterprises = (): boolean => getFilterEnterprises().length > 0;
  const shouldShowFilterWorkshops = (): boolean => getFilterWorkshops().length > 0;
  const shouldShowFilterSections = (): boolean => getFilterSections().length > 0;

  const toggleButton = (index: number) => {
    if (isScaleTooLarge) return;
    if (index === 6) toggleType('ТМЦ');
    else if (index === 7) toggleType('СГД');
    else setActiveButtons(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const handleViewModeToggle = (index: number) => {
    if (isScaleTooLarge) return;
    setViewMode(index === 9 ? 'grid' : 'list');
  };

  const closeExpanded = () => {
    if (expandedButton === null) return;
    setExpandedButton(null);
    setShowSortDropdown(false);
    setShowFilterDropdown(false);
    setFilterCascade(prev => ({ ...prev, activeType: null, activeItemIndex: 0 }));
    setShowOstatokDropdown(false);
    setShowHoldingDropdown(false);
    setShowEnterpriseDropdown(false);
    setShowWorkshopDropdown(false);
    setShowSectionDropdown(false);
  };

  const openButton = (index: number) => {
    if (!activeButtons.includes(index)) setActiveButtons(prev => [...prev, index]);
    setExpandedButton(index);
    if (index === 1) setShowSortDropdown(true);
    if (index === 2) setShowFilterDropdown(true);
    if (index === 8) setShowOstatokDropdown(true);
    if (index === 11) setShowHoldingDropdown(true);
    if (index === 3) setShowEnterpriseDropdown(true);
    if (index === 4) setShowWorkshopDropdown(true);
    if (index === 5) setShowSectionDropdown(true);
  };

  const handleButtonClick = (index: number) => {
    if (isScaleTooLarge) {
      setShowScaleWarning(true);
      if (scaleWarningTimerRef.current) clearTimeout(scaleWarningTimerRef.current);
      scaleWarningTimerRef.current = setTimeout(() => setShowScaleWarning(false), 2000);
      return;
    }
    if (index === 9 || index === 10) { handleViewModeToggle(index); return; }
    if (index === 6 || index === 7) { toggleButton(index); return; }
    if (expandedButton === index) closeExpanded();
    else { if (expandedButton !== null) closeExpanded(); openButton(index); }
  };

  const handleSortSelect = (value: string) => {
    if (value === 'reset') { setSortOption(''); setHasSortSelection(false); }
    else { setSortOption(value); setHasSortSelection(true); }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setHasSearchQuery(value.trim().length > 0);
  };

  const toggleHolding = (holdingId: number) => {
    setSelectedHoldings(prev => prev.includes(holdingId) ? prev.filter(id => id !== holdingId) : [...prev, holdingId]);
  };

  const toggleEnterprise = (enterpriseId: number) => {
    setSelectedEnterprises(prev => prev.includes(enterpriseId) ? prev.filter(id => id !== enterpriseId) : [...prev, enterpriseId]);
  };

  const toggleWorkshop = (workshopId: number) => {
    setSelectedWorkshops(prev => prev.includes(workshopId) ? prev.filter(id => id !== workshopId) : [...prev, workshopId]);
  };

  const toggleSection = (sectionId: number) => {
    setSelectedSections(prev => prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]);
  };

  const handleFilterItemClick = (e: React.MouseEvent, type: FilterSubmenuType, index: number) => {
    e.stopPropagation();
    if (type === null) {
      setSelectedHoldings([]);
      setSelectedEnterprises([]);
      setSelectedWorkshops([]);
      setSelectedSections([]);
      setSelectedStatuses([]);
      setSelectedTypes([]);
      setSelectedOverissue(null);
      setSelectedError(null);
      setFilterCascade({ activeType: null, activeItemIndex: 0 });
      return;
    }
    if (filterCascade.activeType === type) {
      setFilterCascade(prev => ({ ...prev, activeType: null, activeItemIndex: 0 }));
      return;
    }
    setFilterCascade(prev => ({ ...prev, activeType: type, activeItemIndex: index }));
  };

  const toggleFilterHolding = (e: React.MouseEvent, holdingId: number) => {
    e.stopPropagation();
    setSelectedHoldings(prev => {
      const newSelected = prev.includes(holdingId) ? prev.filter(id => id !== holdingId) : [...prev, holdingId];
      if (newSelected.length > 0) {
        const validEnterpriseIds = enterprises.filter(ent => newSelected.includes(ent.holdingId)).map(ent => ent.id);
        setSelectedEnterprises(prevE => prevE.filter(id => validEnterpriseIds.includes(id)));
        const validWorkshopIds = workshops.filter(w => validEnterpriseIds.includes(w.enterpriseId)).map(w => w.id);
        setSelectedWorkshops(prevW => prevW.filter(id => validWorkshopIds.includes(id)));
        const validSectionIds = sections.filter(s => validWorkshopIds.includes(s.workshopId)).map(s => s.id);
        setSelectedSections(prevS => prevS.filter(id => validSectionIds.includes(id)));
      }
      return newSelected;
    });
  };

  const toggleFilterEnterprise = (e: React.MouseEvent, enterpriseId: number) => {
    e.stopPropagation();
    setSelectedEnterprises(prev => {
      const newSelected = prev.includes(enterpriseId) ? prev.filter(id => id !== enterpriseId) : [...prev, enterpriseId];
      if (newSelected.length > 0) {
        const validWorkshopIds = workshops.filter(w => newSelected.includes(w.enterpriseId)).map(w => w.id);
        setSelectedWorkshops(prevW => prevW.filter(id => validWorkshopIds.includes(id)));
        const validSectionIds = sections.filter(s => validWorkshopIds.includes(s.workshopId)).map(s => s.id);
        setSelectedSections(prevS => prevS.filter(id => validSectionIds.includes(id)));
      }
      return newSelected;
    });
  };

  const toggleFilterWorkshop = (e: React.MouseEvent, workshopId: number) => {
    e.stopPropagation();
    setSelectedWorkshops(prev => {
      const newSelected = prev.includes(workshopId) ? prev.filter(id => id !== workshopId) : [...prev, workshopId];
      if (newSelected.length > 0) {
        const validSectionIds = sections.filter(s => newSelected.includes(s.workshopId)).map(s => s.id);
        setSelectedSections(prevS => prevS.filter(id => validSectionIds.includes(id)));
      }
      return newSelected;
    });
  };

  const toggleFilterSection = (e: React.MouseEvent, sectionId: number) => {
    e.stopPropagation();
    setSelectedSections(prev => prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const selectOverissue = (value: string) => setSelectedOverissue(value);
  const selectError = (value: string) => setSelectedError(value);

  const sortOptions = [
    { value: 'nameAsc', label: 'По названию (А-Я)' },
    { value: 'nameDesc', label: 'По названию (Я-А)' },
    { value: 'placementAsc', label: 'По размещению' },
    { value: 'statusDesc', label: 'По статусу' },
    { value: 'tmcSgd', label: 'По типу (ТМЦ-СГД)' },
    { value: 'reset', label: 'Сбросить сортировку' },
  ];

  const filterItems = [
    { label: 'Размещение станции', type: 'placement' as FilterSubmenuType },
    { label: 'Статус станции', type: 'status' as FilterSubmenuType },
    { label: 'Тип станции', type: 'type' as FilterSubmenuType },
    { label: 'Выдано сверхнормы', type: 'overissue' as FilterSubmenuType },
    { label: 'Ошибка станции', type: 'error' as FilterSubmenuType },
    { label: 'Очистить фильтр', type: null },
  ];

  const statusOptions = ['В работе', 'Не в сети', 'Минимальный остаток', 'Критический остаток'];
  const typeOptions = ['СГД', 'Операционная карта', 'ТМЦ', 'Связанные модули'];

  const buttons = [
    { icon: Icon1, label: 'Поиск' },
    { icon: Icon2, label: 'Сортировка' },
    { icon: Icon3, label: 'Фильтр' },
    { icon: Icon4, label: 'Предприятие' },
    { icon: Icon5, label: 'Цех' },
    { icon: Icon6, label: 'Участок' },
    { icon: Icon7, label: 'СГД' },
    { icon: Icon8, label: 'ТМЦ' },
    { icon: Icon9, label: 'Остаток' },
    { icon: Icon10, label: '' },
    { icon: Icon11, label: '' },
    { icon: Icon12, label: 'Холдинг' },
  ];

  const isPlacementActive = selectedHoldings.length > 0 || selectedEnterprises.length > 0 || selectedWorkshops.length > 0 || selectedSections.length > 0;
  const isStatusActive = selectedStatuses.length > 0;
  const isTypeActive = selectedTypes.length > 0;
  const isOverissueActive = selectedOverissue !== null;
  const isErrorActive = selectedError !== null;

  const getExpandedWidth = (index: number): number => index === 0 ? 314 : 226;

  const calculateGapWidth = () => {
    if (expandedButton === null) return 342;
    if (expandedButton <= 2) {
      const expandedWidth = getExpandedWidth(expandedButton);
      return Math.max(0, 342 - (expandedWidth - 54));
    }
    return 342;
  };

  const renderFilterCascadeWindows = () => {
    if (!showFilterDropdown || !filterCascade.activeType) return null;

    const windows: JSX.Element[] = [];
    let leftOffset = 230;
    const itemHeight = 38;
    const baseTop = filterCascade.activeItemIndex * itemHeight;

    if (filterCascade.activeType === 'placement') {
      const filterHoldings = getFilterHoldings();
      windows.push(
        <div key="holding" style={{ position: 'absolute', left: `${leftOffset}px`, top: `${baseTop}px`, width: '226px', backgroundColor: '#FFFFFF', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ height: '54px', backgroundColor: '#666EFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Холдинг</span>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filterHoldings.map((holding) => {
              const isChecked = selectedHoldings.includes(holding.id);
              return (
                <div key={holding.id} onClick={(e) => toggleFilterHolding(e, holding.id)} style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isChecked ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}
                  onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                  onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                  <span style={{ fontSize: '15px', fontWeight: 500, color: isChecked ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{holding.name}</span>
                  <input type="checkbox" checked={isChecked} onChange={(e) => { e.stopPropagation(); toggleFilterHolding(e as any, holding.id); }} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} />
                </div>
              );
            })}
          </div>
        </div>
      );
      leftOffset += 230;

      if (shouldShowFilterEnterprises()) {
        const filterEnterprises = getFilterEnterprises();
        windows.push(
          <div key="enterprise" style={{ position: 'absolute', left: `${leftOffset}px`, top: `${baseTop}px`, width: '226px', backgroundColor: '#FFFFFF', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ height: '54px', backgroundColor: '#666EFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Предприятие</span>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filterEnterprises.map((enterprise) => {
                const isChecked = selectedEnterprises.includes(enterprise.id);
                return (
                  <div key={enterprise.id} onClick={(e) => toggleFilterEnterprise(e, enterprise.id)} style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isChecked ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}
                    onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                    onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: isChecked ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{enterprise.name}</span>
                    <input type="checkbox" checked={isChecked} onChange={(e) => { e.stopPropagation(); toggleFilterEnterprise(e as any, enterprise.id); }} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} />
                  </div>
                );
              })}
            </div>
          </div>
        );
        leftOffset += 230;
      }

      if (shouldShowFilterWorkshops()) {
        const filterWorkshops = getFilterWorkshops();
        windows.push(
          <div key="workshop" style={{ position: 'absolute', left: `${leftOffset}px`, top: `${baseTop}px`, width: '226px', backgroundColor: '#FFFFFF', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ height: '54px', backgroundColor: '#666EFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Цех</span>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filterWorkshops.map((workshop) => {
                const isChecked = selectedWorkshops.includes(workshop.id);
                return (
                  <div key={workshop.id} onClick={(e) => toggleFilterWorkshop(e, workshop.id)} style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isChecked ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}
                    onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                    onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: isChecked ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{workshop.name}</span>
                    <input type="checkbox" checked={isChecked} onChange={(e) => { e.stopPropagation(); toggleFilterWorkshop(e as any, workshop.id); }} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} />
                  </div>
                );
              })}
            </div>
          </div>
        );
        leftOffset += 230;
      }

      if (shouldShowFilterSections()) {
        const filterSections = getFilterSections();
        windows.push(
          <div key="section" style={{ position: 'absolute', left: `${leftOffset}px`, top: `${baseTop}px`, width: '226px', backgroundColor: '#FFFFFF', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ height: '54px', backgroundColor: '#666EFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Участок</span>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filterSections.map((section) => {
                const isChecked = selectedSections.includes(section.id);
                return (
                  <div key={section.id} onClick={(e) => toggleFilterSection(e, section.id)} style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isChecked ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}
                    onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                    onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: isChecked ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{section.name}</span>
                    <input type="checkbox" checked={isChecked} onChange={(e) => { e.stopPropagation(); toggleFilterSection(e as any, section.id); }} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} />
                  </div>
                );
              })}
            </div>
          </div>
        );
        leftOffset += 230;
      }
    }

    if (filterCascade.activeType === 'status') {
      windows.push(
        <div key="status" style={{ position: 'absolute', left: `${leftOffset}px`, top: `${baseTop}px`, width: '226px', backgroundColor: '#FFFFFF', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
          {statusOptions.map((status) => {
            const isChecked = selectedStatuses.includes(status);
            return (
              <div key={status} onClick={() => toggleStatus(status)} style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isChecked ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                <span style={{ fontSize: '15px', fontWeight: 500, color: isChecked ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap' }}>{status}</span>
                <input type="checkbox" checked={isChecked} onChange={() => toggleStatus(status)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} />
              </div>
            );
          })}
        </div>
      );
    }

    if (filterCascade.activeType === 'type') {
      windows.push(
        <div key="type" style={{ position: 'absolute', left: `${leftOffset}px`, top: `${baseTop}px`, width: '226px', backgroundColor: '#FFFFFF', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
          {typeOptions.map((type) => {
            const isChecked = selectedTypes.includes(type);
            return (
              <div key={type} onClick={() => toggleType(type)} style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isChecked ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                <span style={{ fontSize: '15px', fontWeight: 500, color: isChecked ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap' }}>{type}</span>
                <input type="checkbox" checked={isChecked} onChange={() => toggleType(type)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} />
              </div>
            );
          })}
        </div>
      );
    }

    if (filterCascade.activeType === 'overissue') {
      windows.push(
        <div key="overissue" style={{ position: 'absolute', left: `${leftOffset}px`, top: `${baseTop}px`, width: '226px', backgroundColor: '#FFFFFF', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
          {['Да', 'Нет'].map((option) => {
            const isChecked = selectedOverissue === option;
            return (
              <div key={option} onClick={() => selectOverissue(option)} style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isChecked ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                <span style={{ fontSize: '15px', fontWeight: 500, color: isChecked ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap' }}>{option}</span>
                <input type="radio" name="overissue" checked={isChecked} onChange={() => selectOverissue(option)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} />
              </div>
            );
          })}
        </div>
      );
    }

    if (filterCascade.activeType === 'error') {
      windows.push(
        <div key="error" style={{ position: 'absolute', left: `${leftOffset}px`, top: `${baseTop}px`, width: '226px', backgroundColor: '#FFFFFF', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
          {['Да', 'Нет'].map((option) => {
            const isChecked = selectedError === option;
            return (
              <div key={option} onClick={() => selectError(option)} style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isChecked ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                <span style={{ fontSize: '15px', fontWeight: 500, color: isChecked ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap' }}>{option}</span>
                <input type="radio" name="error" checked={isChecked} onChange={() => selectError(option)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} />
              </div>
            );
          })}
        </div>
      );
    }

    return windows;
  };

  const renderButton = (button: typeof buttons[0], globalIdx: number) => {
    const isActive = activeButtons.includes(globalIdx);
    const isExpanded = expandedButton === globalIdx;
    const isRightTwo = globalIdx === 9 || globalIdx === 10;
    const isSearchButton = globalIdx === 0;
    const isSortButton = globalIdx === 1;
    const isFilterButton = globalIdx === 2;
    const isOstatokButton = globalIdx === 8;
    const isHoldingButton = globalIdx === 11;
    const isEnterpriseButton = globalIdx === 3;
    const isWorkshopButton = globalIdx === 4;
    const isSectionButton = globalIdx === 5;
    const isNonExpandable = [6, 7].includes(globalIdx);

    let showAsActive = isActive;
    if (isSearchButton) showAsActive = hasSearchQuery;
    else if (isSortButton) showAsActive = hasSortSelection;
    else if (isFilterButton) showAsActive = isFilterActive;
    else if (isHoldingButton) showAsActive = isHoldingActive;
    else if (isEnterpriseButton) showAsActive = isEnterpriseActive;
    else if (isWorkshopButton) showAsActive = isWorkshopActive;
    else if (isSectionButton) showAsActive = isSectionActive;
    else if (isOstatokButton) showAsActive = isOstatokActive;
    else if (globalIdx === 6) showAsActive = isTmcEnabled;
    else if (globalIdx === 7) showAsActive = isSgdEnabled;

    const backgroundColor = showAsActive ? '#666EFE' : '#FFFFFF';

    if (isRightTwo) {
      return (
        <button key={`button-${globalIdx}`} data-button-id={globalIdx} onClick={() => handleButtonClick(globalIdx)}
          style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor, border: 'none', cursor: isScaleTooLarge ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: showAsActive ? '0 4px 12px rgba(102, 110, 254, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)', transition: 'all 0.3s ease', opacity: isScaleTooLarge ? 0.5 : 1 }}>
          <img src={button.icon} alt={`icon${globalIdx + 1}`} style={{ width: '24px', height: '24px', filter: showAsActive ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
        </button>
      );
    }

    if (isNonExpandable) {
      return (
        <button key={`button-${globalIdx}`} data-button-id={globalIdx} onClick={() => toggleButton(globalIdx)}
          style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor, border: 'none', cursor: isScaleTooLarge ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: showAsActive ? '0 4px 12px rgba(102, 110, 254, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)', transition: 'all 0.3s ease', opacity: isScaleTooLarge ? 0.5 : 1 }}>
          <img src={button.icon} alt={`icon${globalIdx + 1}`} style={{ width: '24px', height: '24px', filter: showAsActive ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
        </button>
      );
    }

    if (isSearchButton) {
      const expandedWidth = 314;
      return (
        <div key={`button-${globalIdx}`} style={{ display: 'inline-flex' }} data-button-id={globalIdx}>
          <div ref={isExpanded ? expandedRef : null} onClick={() => handleButtonClick(globalIdx)}
            style={{ width: isExpanded ? expandedWidth : 54, height: 54, borderRadius: 27, backgroundColor: isExpanded ? '#666EFE' : backgroundColor, cursor: isScaleTooLarge ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', padding: isExpanded ? '0 7px' : '0', boxShadow: (showAsActive && !isExpanded) ? '0 4px 12px rgba(102, 110, 254, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)', transition: 'width 0.4s ease, background-color 0.3s ease, box-shadow 0.3s ease, padding 0.4s ease', zIndex: isExpanded ? 200 : 1, position: 'relative', overflow: 'hidden', opacity: isScaleTooLarge ? 0.5 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: isExpanded ? 'auto' : 'none' }}>
              {isExpanded && (
                <>
                  <div style={{ width: 74, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 400, whiteSpace: 'nowrap' }}>Поиск</span>
                  </div>
                  <input ref={searchInputRef} type="text" placeholder="" value={searchQuery} onChange={handleSearchChange}
                    style={{ width: 227, height: 42, borderRadius: 27, backgroundColor: '#E9EDFF', border: 'none', padding: '0 16px', fontSize: 14, color: '#2D4059', outline: 'none' }}
                    onClick={(e) => e.stopPropagation()} disabled={isScaleTooLarge} />
                </>
              )}
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: isExpanded ? 0 : 1, transition: 'opacity 0.3s ease 0.1s', pointerEvents: isExpanded ? 'none' : 'auto' }}>
              <img src={button.icon} alt={`icon${globalIdx + 1}`} style={{ width: 24, height: 24, filter: showAsActive ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
            </div>
          </div>
        </div>
      );
    }

    if (isSortButton) {
      return (
        <div key={`button-${globalIdx}`} style={{ display: 'inline-flex', position: 'relative' }} data-button-id={globalIdx}>
          <div ref={isExpanded ? expandedRef : null} onClick={() => handleButtonClick(globalIdx)}
            style={{ width: isExpanded ? 226 : 54, height: isExpanded ? 'auto' : 54, minHeight: isExpanded ? 'auto' : 54, borderRadius: 27, backgroundColor: isExpanded ? '#FFFFFF' : backgroundColor, cursor: isScaleTooLarge ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', boxShadow: (showAsActive && !isExpanded) ? '0 4px 12px rgba(102, 110, 254, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)', transition: 'width 0.4s ease, height 0.4s ease, min-height 0.4s ease, background-color 0.3s ease, box-shadow 0.3s ease', zIndex: isExpanded ? 200 : 1, position: 'relative', overflow: 'visible', opacity: isScaleTooLarge ? 0.5 : 1 }}>
            <div style={{ opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: isExpanded ? 'auto' : 'none' }}>
              {isExpanded && (
                <>
                  <div style={{ height: 54, backgroundColor: '#666EFE', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 27, borderTopRightRadius: 27 }}>
                    <span style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 400, whiteSpace: 'nowrap' }}>{button.label}</span>
                  </div>
                  <div ref={sortDropdownRef} style={{ backgroundColor: '#FFFFFF', borderBottomLeftRadius: 27, borderBottomRightRadius: 27, overflow: 'hidden' }}>
                    <AnimatePresence>
                      {showSortDropdown && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ backgroundColor: '#FFFFFF' }}>
                          {sortOptions.map((option) => {
                            const isReset = option.value === 'reset';
                            const isActiveOption = !isReset && sortOption === option.value;
                            return (
                              <div key={option.value} onClick={(e) => { e.stopPropagation(); handleSortSelect(option.value); }}
                                onMouseEnter={(e) => { if (!isActiveOption && !isReset) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                                onMouseLeave={(e) => { if (!isActiveOption && !isReset) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                                style={{ height: 38, padding: '0 16px', display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: isActiveOption ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}>
                                <span style={{ fontSize: 15, fontWeight: 500, color: isActiveOption ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap' }}>{option.label}</span>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: isExpanded ? 0 : 1, transition: 'opacity 0.3s ease 0.1s', pointerEvents: isExpanded ? 'none' : 'auto' }}>
              <img src={button.icon} alt={`icon${globalIdx + 1}`} style={{ width: 24, height: 24, filter: showAsActive ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
            </div>
          </div>
        </div>
      );
    }

    if (isFilterButton) {
      return (
        <div key={`button-${globalIdx}`} style={{ display: 'inline-flex', position: 'relative' }} data-button-id={globalIdx}>
          <div ref={isExpanded ? expandedRef : null} onClick={() => handleButtonClick(globalIdx)}
            style={{ width: isExpanded ? 226 : 54, height: isExpanded ? 'auto' : 54, minHeight: isExpanded ? 'auto' : 54, borderRadius: 27, backgroundColor: isExpanded ? '#FFFFFF' : backgroundColor, cursor: isScaleTooLarge ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', boxShadow: (showAsActive && !isExpanded) ? '0 4px 12px rgba(102, 110, 254, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)', transition: 'width 0.4s ease, height 0.4s ease, min-height 0.4s ease, background-color 0.3s ease, box-shadow 0.3s ease', zIndex: isExpanded ? 200 : 1, position: 'relative', overflow: 'visible', opacity: isScaleTooLarge ? 0.5 : 1 }}>
            <div style={{ opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: isExpanded ? 'auto' : 'none' }}>
              {isExpanded && (
                <>
                  <div style={{ height: 54, backgroundColor: '#666EFE', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 27, borderTopRightRadius: 27 }}>
                    <span style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 400, whiteSpace: 'nowrap' }}>{button.label}</span>
                  </div>
                  <div ref={filterDropdownRef} style={{ backgroundColor: '#FFFFFF', borderBottomLeftRadius: 27, borderBottomRightRadius: 27, overflow: 'visible', position: 'relative' }}>
                    <AnimatePresence>
                      {showFilterDropdown && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ backgroundColor: '#FFFFFF', position: 'relative' }}>
                          {filterItems.map((item, index) => {
                            const isClearFilter = item.type === null;
                            let isItemActive = false;
                            if (item.type === 'placement') isItemActive = isPlacementActive;
                            else if (item.type === 'status') isItemActive = isStatusActive;
                            else if (item.type === 'type') isItemActive = isTypeActive;
                            else if (item.type === 'overissue') isItemActive = isOverissueActive;
                            else if (item.type === 'error') isItemActive = isErrorActive;
                            const isLast = index === filterItems.length - 1;
                            return (
                              <div key={item.label} onClick={(e) => handleFilterItemClick(e, item.type, index)}
                                style={{ height: 38, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isItemActive ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease', borderBottomLeftRadius: isLast ? 27 : 0, borderBottomRightRadius: isLast ? 27 : 0 }}
                                onMouseEnter={(e) => { if (!isItemActive) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                                onMouseLeave={(e) => { if (!isItemActive) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                                <span style={{ fontSize: 15, fontWeight: 500, color: isItemActive ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap' }}>{item.label}</span>
                                {!isClearFilter && (
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M6 4L10 8L6 12" stroke={isItemActive ? '#2D4059' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {renderFilterCascadeWindows()}
                  </div>
                </>
              )}
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: isExpanded ? 0 : 1, transition: 'opacity 0.3s ease 0.1s', pointerEvents: isExpanded ? 'none' : 'auto' }}>
              <img src={button.icon} alt={`icon${globalIdx + 1}`} style={{ width: 24, height: 24, filter: showAsActive ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
            </div>
          </div>
        </div>
      );
    }

    if (isOstatokButton) {
      return (
        <div key={`button-${globalIdx}`} style={{ display: 'inline-flex', position: 'relative' }} data-button-id={globalIdx}>
          <div ref={isExpanded ? expandedRef : null} onClick={() => handleButtonClick(globalIdx)}
            style={{ width: isExpanded ? 226 : 54, height: isExpanded ? 'auto' : 54, minHeight: isExpanded ? 'auto' : 54, borderRadius: 27, backgroundColor: isExpanded ? '#FFFFFF' : backgroundColor, cursor: isScaleTooLarge ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', boxShadow: (showAsActive && !isExpanded) ? '0 4px 12px rgba(102, 110, 254, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)', transition: 'width 0.4s ease, height 0.4s ease, min-height 0.4s ease, background-color 0.3s ease, box-shadow 0.3s ease', zIndex: isExpanded ? 200 : 1, position: 'relative', overflow: 'visible', opacity: isScaleTooLarge ? 0.5 : 1 }}>
            <div style={{ opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: isExpanded ? 'auto' : 'none' }}>
              {isExpanded && (
                <>
                  <div style={{ height: 54, backgroundColor: '#666EFE', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 27, borderTopRightRadius: 27 }}>
                    <span style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 400, whiteSpace: 'nowrap' }}>{button.label}</span>
                  </div>
                  <div ref={ostatokDropdownRef} style={{ backgroundColor: '#FFFFFF', borderBottomLeftRadius: 27, borderBottomRightRadius: 27, overflow: 'hidden', padding: 16 }}>
                    <AnimatePresence>
                      {showOstatokDropdown && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); toggleStatus('Минимальный остаток'); }}>
                            <span style={{ fontSize: 15, fontWeight: 500, color: '#2D4059', whiteSpace: 'nowrap' }}>Минимальный остаток</span>
                            <input type="checkbox" checked={minOstatokEnabled} onChange={(e) => { e.stopPropagation(); toggleStatus('Минимальный остаток'); }} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} disabled={isScaleTooLarge} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); toggleStatus('Критический остаток'); }}>
                            <span style={{ fontSize: 15, fontWeight: 500, color: '#2D4059', whiteSpace: 'nowrap' }}>Критический остаток</span>
                            <input type="checkbox" checked={criticalOstatokEnabled} onChange={(e) => { e.stopPropagation(); toggleStatus('Критический остаток'); }} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} disabled={isScaleTooLarge} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: isExpanded ? 0 : 1, transition: 'opacity 0.3s ease 0.1s', pointerEvents: isExpanded ? 'none' : 'auto' }}>
              <img src={button.icon} alt={`icon${globalIdx + 1}`} style={{ width: 24, height: 24, filter: showAsActive ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
            </div>
          </div>
        </div>
      );
    }

    if (isHoldingButton || isEnterpriseButton || isWorkshopButton || isSectionButton) {
      let dropdownRef: React.RefObject<HTMLDivElement | null>;
      let showDropdown: boolean;
      let items: { id: number; name: string }[] = [];
      let selectedIds: number[];
      let toggleFn: (id: number) => void;

      if (isHoldingButton) {
        dropdownRef = holdingDropdownRef;
        showDropdown = showHoldingDropdown;
        items = holdings;
        selectedIds = selectedHoldings;
        toggleFn = toggleHolding;
      } else if (isEnterpriseButton) {
        dropdownRef = enterpriseDropdownRef;
        showDropdown = showEnterpriseDropdown;
        items = enterprises;
        selectedIds = selectedEnterprises;
        toggleFn = toggleEnterprise;
      } else if (isWorkshopButton) {
        dropdownRef = workshopDropdownRef;
        showDropdown = showWorkshopDropdown;
        items = workshops;
        selectedIds = selectedWorkshops;
        toggleFn = toggleWorkshop;
      } else {
        dropdownRef = sectionDropdownRef;
        showDropdown = showSectionDropdown;
        items = sections;
        selectedIds = selectedSections;
        toggleFn = toggleSection;
      }

      return (
        <div key={`button-${globalIdx}`} style={{ display: 'inline-flex', position: 'relative' }} data-button-id={globalIdx}>
          <div ref={isExpanded ? expandedRef : null} onClick={() => handleButtonClick(globalIdx)}
            style={{ width: isExpanded ? 226 : 54, height: isExpanded ? 'auto' : 54, minHeight: isExpanded ? 'auto' : 54, borderRadius: 27, backgroundColor: isExpanded ? '#FFFFFF' : backgroundColor, cursor: isScaleTooLarge ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', boxShadow: (showAsActive && !isExpanded) ? '0 4px 12px rgba(102, 110, 254, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)', transition: 'width 0.4s ease, height 0.4s ease, min-height 0.4s ease, background-color 0.3s ease, box-shadow 0.3s ease', zIndex: isExpanded ? 200 : 1, position: 'relative', overflow: 'visible', opacity: isScaleTooLarge ? 0.5 : 1 }}>
            <div style={{ opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: isExpanded ? 'auto' : 'none' }}>
              {isExpanded && (
                <>
                  <div style={{ height: 54, backgroundColor: '#666EFE', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 27, borderTopRightRadius: 27 }}>
                    <span style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 400, whiteSpace: 'nowrap' }}>{button.label}</span>
                  </div>
                  <div ref={dropdownRef} style={{ backgroundColor: '#FFFFFF', borderBottomLeftRadius: 27, borderBottomRightRadius: 27, overflow: 'hidden', padding: '8px 0', maxHeight: 300, overflowY: 'auto' }}>
                    <AnimatePresence>
                      {showDropdown && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ backgroundColor: '#FFFFFF' }}>
                          {items.map((item) => {
                            const isChecked = selectedIds.includes(item.id);
                            return (
                              <div key={item.id} onClick={(e) => { e.stopPropagation(); toggleFn(item.id); }}
                                onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#E2E8FF'; }}
                                onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                                style={{ height: 38, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isChecked ? '#BCC8FF' : '#FFFFFF', transition: 'background-color 0.2s ease' }}>
                                <span style={{ fontSize: 15, fontWeight: 500, color: isChecked ? '#2D4059' : '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{item.name}</span>
                                <input type="checkbox" checked={isChecked} onChange={(e) => { e.stopPropagation(); toggleFn(item.id); }} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#666EFE' }} onClick={(e) => e.stopPropagation()} disabled={isScaleTooLarge} />
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: isExpanded ? 0 : 1, transition: 'opacity 0.3s ease 0.1s', pointerEvents: isExpanded ? 'none' : 'auto' }}>
              <img src={button.icon} alt={`icon${globalIdx + 1}`} style={{ width: 24, height: 24, filter: showAsActive ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderStationsGrid = () => (
    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 220px)', gap: '30px', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '40px', paddingRight: '15px', width: 'max-content' }}>
      {stationsStatic.map((station) => {
        const dynamic = stationsDynamic.get(station.uid);
        return <StationCell key={station.uid} uid={station.uid} name={station.name} workshop={station.workshop} section={station.section} status={station.status} stationType={station.stationType} parentUid={station.parentUid} hasError={station.hasError} isTmc={station.isTmc} isSgd={station.isSgd} isOk={station.isOk} filledCellsPercent={dynamic?.filledCellsPercent} remainingNomenclaturePercent={dynamic?.remainingNomenclaturePercent} readyPartsPercent={dynamic?.readyPartsPercent} totalCells={dynamic?.totalCells} filledCells={dynamic?.filledCells} templateNomenclatureCount={dynamic?.templateNomenclatureCount} remainingNomenclatureCount={dynamic?.remainingNomenclatureCount} maxReadyParts={dynamic?.maxReadyParts} readyPartsCount={dynamic?.readyPartsCount} onOpenSchablonPopup={handleOpenSchablonPopup} />;
      })}
    </motion.div>
  );

  const renderStationsList = () => (
    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '40px', paddingRight: '15px', width: 'max-content' }}>
      {stationsStatic.map((station) => {
        const dynamic = stationsDynamic.get(station.uid);
        return <StationRow key={station.uid} uid={station.uid} name={station.name} workshop={station.workshop} section={station.section} status={station.status} stationType={station.stationType} parentUid={station.parentUid} hasError={station.hasError} isTmc={station.isTmc} isSgd={station.isSgd} isOk={station.isOk} filledCellsPercent={dynamic?.filledCellsPercent} remainingNomenclaturePercent={dynamic?.remainingNomenclaturePercent} readyPartsPercent={dynamic?.readyPartsPercent} totalCells={dynamic?.totalCells} filledCells={dynamic?.filledCells} templateNomenclatureCount={dynamic?.templateNomenclatureCount} remainingNomenclatureCount={dynamic?.remainingNomenclatureCount} maxReadyParts={dynamic?.maxReadyParts} readyPartsCount={dynamic?.readyPartsCount} onOpenSchablonPopup={handleOpenSchablonPopup} />;
      })}
    </motion.div>
  );

  const gapWidth = calculateGapWidth();
  const scrollAreaTop = adaptiveGaps.topPadding + HEADER_HEIGHT + adaptiveGaps.controlsMarginTop + CONTROLS_HEIGHT + adaptiveGaps.scrollMarginTop;

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100%' }}>
      <SchablonPopup
        isOpen={schablonPopupData.isOpen}
        onClose={handleCloseSchablonPopup}
        uid={schablonPopupData.uid}
        name={schablonPopupData.name}
        workshop={schablonPopupData.workshop}
        section={schablonPopupData.section}
        status={schablonPopupData.status}
        configurationUid={schablonPopupData.configurationUid}
        onTemplateAssigned={() => fetchFilteredStations()}
      />

      <AnimatePresence>
        {showScaleWarning && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }}
            style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#F44336', color: '#FFFFFF', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: '500', zIndex: 1000, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', whiteSpace: 'nowrap' }}>
            Верните экран в нормальный масштаб
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ paddingTop: `${adaptiveGaps.topPadding}px`, paddingLeft: '60px' }}>
        <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '30px', fontWeight: 'bold', letterSpacing: '0', color: '#2D4059', margin: 0 }}>Панель управления станциями</h1>
      </div>

      <div ref={controlsRowRef} style={{ marginTop: `${adaptiveGaps.controlsMarginTop}px`, paddingLeft: '70px', paddingRight: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: '54px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '20px' }}>{buttons.slice(0, 3).map((button, idx) => renderButton(button, idx))}</div>
          <div style={{ width: `${gapWidth}px`, transition: 'width 0.4s ease', overflow: 'hidden' }} />
          <div style={{ display: 'flex', gap: '20px' }}>
            {renderButton(buttons[11], 11)}
            {renderButton(buttons[3], 3)}
            {renderButton(buttons[4], 4)}
            {renderButton(buttons[5], 5)}
          </div>
          <div style={{ width: '90px' }} />
          <div style={{ display: 'flex', gap: '20px' }}>{buttons.slice(6, 8).map((button, idx) => renderButton(button, idx + 6))}</div>
          <div style={{ width: '90px' }} />
          <div style={{ display: 'flex', gap: '20px' }}>{buttons.slice(8, 9).map((button, idx) => renderButton(button, idx + 8))}</div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>{buttons.slice(9, 11).map((button, idx) => renderButton(button, idx + 9))}</div>
      </div>

      <div style={{ position: 'absolute', top: `${scrollAreaTop}px`, left: '0', right: '0', height: `${SCROLL_AREA_HEIGHT}px`, zIndex: 1 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div ref={scrollContainerRef} style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>Загрузка станций...</div>
            ) : stationsError ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#F44336' }}>{stationsError}</div>
            ) : stationsStatic.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>Нет данных о станциях</div>
            ) : (
              <AnimatePresence mode="wait">{viewMode === 'grid' ? renderStationsGrid() : renderStationsList()}</AnimatePresence>
            )}
          </div>
          <div style={{ position: 'absolute', right: '15px', top: 0 }}>
            <CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={SCROLL_AREA_HEIGHT} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationsPage;