// ConstantInfo.ts — полный файл
const ConstantInfo = {
  // База
  serverHost: window.config.ip_api.replace('http://', '').replace('https://', ''),
  fileDir: window.config.ip_api + '/',

  // API базовый URL
  apiBaseUrl: `${window.config.ip_api}`,
  
  // WebSocket базовый URL
  wsBaseUrl: `ws://${window.config.ip_api.replace('http://', '').replace('https://', '')}`,

  // Авторизация и т.п.
  restApiLogin: '/api/auth/login',
  restApiCheckAuth: '/api/auth/check_auth',
  restApiRefreshToken: '/api/auth/refresh_token',
  restApiLogout: '/api/auth/logout',
  checkAuthPeriod: 50000,
  
  // Спящий режим
  restApiCheckPassword: '/api/auth/check_password',
  inactivityTimeout: 5 * 60 * 1000,
  warningTimeout: 30 * 1000,
  
  // Станции
  restApiStationsStatic: '/api/stations/static',
  restApiStationsDynamic: '/api/stations/dynamic',
  restApiStationStatic: (uid: string) => `/api/stations/static/${uid}`,
  restApiStationDynamic: (uid: string) => `/api/stations/dynamic/${uid}`,
  
  // WebSocket
  wsStationsStatic: '/topic/stations/static',
  wsStationsDynamic: '/topic/stations/dynamic',
  wsStationsPath: '/ws-stations',
  
  // Иерархия размещения
  restApiLocationHierarchy: '/api/locations/hierarchy',
  
  // Фильтры пользователя
  restApiUserFilters: '/api/user/filters',
  
  // Остальные эндпоинты
  restApiCreateLocation: '/api/locations',
  restApiCreateStation: '/api/stations',
  restApiDashboardStats: '/api/dashboard/stats',
  restApiUploadLocationPhoto: (locationId: number) => `/api/locations/${locationId}/photo`,
  restApiGetLocationPhoto: (locationId: number) => `/api/locations/${locationId}/photo`,
  restApiDeleteLocationPhoto: (locationId: number) => `/api/locations/${locationId}/photo`,
  restApiCreateOrUpdateStationPosition: '/api/station-positions',
  restApiGetStationPositionsByLocation: (locationId: number) => `/api/station-positions/location/${locationId}`,
  restApiGetStationPositionsByStation: (stationId: number) => `/api/station-positions/station/${stationId}`,
  restApiGetStationPosition: (stationId: number, locationId: number) => `/api/station-positions/${stationId}/${locationId}`,
  restApiDeleteStationPosition: (stationId: number, locationId: number) => `/api/station-positions/${stationId}/${locationId}`,
  restApiDeleteAllStationPositionsByStation: (stationId: number) => `/api/station-positions/station/${stationId}`,
  restApiDeleteAllStationPositionsByLocation: (locationId: number) => `/api/station-positions/location/${locationId}`,
  getLocationPhotoUrl: (filePath: string, fileName: string) => 
    `${ConstantInfo.fileDir}uploads/${filePath}${fileName}`,
  restApiStationsStaticFiltered: '/api/stations/static/filtered',
  restApiStationsDynamicFiltered: '/api/stations/dynamic/filtered',
  
  // Тестовые документы
  restApiTestDocuments: '/api/test-documents',
  restApiTestDocumentsDrafts: '/api/test-documents/drafts',
  restApiTestDocument: (id: number) => `/api/test-documents/${id}`,
  
  // Номенклатура
  restApiNomenclatureGenerate: '/api/nomenclature/generate',
  restApiNomenclatureDraft: '/api/nomenclature/draft',
  restApiNomenclatureTree: '/api/nomenclature/tree',
  restApiNomenclatureDeleteItems: '/api/nomenclature/items',
  restApiNomenclatureCopyItems: '/api/nomenclature/items/copy',
  restApiNomenclatureMoveItems: '/api/nomenclature/items/move',
  restApiNomenclatureGroups: '/api/nomenclature/groups',
  restApiNomenclatureGetMaterial: (uid: string) => `/api/nomenclature/${uid}`,
  restApiNomenclatureRenameGroup: (uid: string) => `/api/nomenclature/groups/${uid}`,
  
  // НОВЫЕ: справочники для формы номенклатуры
  restApiNomenclatureTypeMaterials: '/api/nomenclature/type-materials',
  restApiNomenclatureTypePurposes: '/api/nomenclature/type-purposes',
  restApiNomenclatureTypeProducts: '/api/nomenclature/type-products',
  restApiNomenclatureMeasures: '/api/nomenclature/measures',
  restApiNomenclatureManufacturers: '/api/nomenclature/manufacturers',
  restApiNomenclatureBrands: '/api/nomenclature/brands',
  restApiNomenclatureModels: '/api/nomenclature/models',
  restApiNomenclatureCountries: '/api/nomenclature/countries',
  restApiNomenclatureImages: (materialUid: string) => `/api/nomenclature/${materialUid}/images`,
  restApiNomenclatureDeleteImage: (uid: string) => `/api/nomenclature/images/${uid}`,
  restApiNomenclatureBlueprints: (materialUid: string) => `/api/nomenclature/${materialUid}/blueprints`,
  restApiNomenclatureDeleteBlueprint: (uid: string) => `/api/nomenclature/blueprints/${uid}`,
  restApiNomenclatureQrcodes: (materialUid: string) => `/api/nomenclature/${materialUid}/qrcodes`,
  restApiNomenclatureDeleteQrcode: (uid: string) => `/api/nomenclature/qrcodes/${uid}`,
  restApiNomenclaturePrices: (materialUid: string) => `/api/nomenclature/${materialUid}/prices`,
  restApiNomenclatureDeletePrice: (priceUid: string) => `/api/nomenclature/prices/${priceUid}`,
  restApiNomenclatureSuppliers: '/api/nomenclature/suppliers',
    restApiNomenclatureCharacteristics: (materialUid: string) => `/api/nomenclature/${materialUid}/characteristics`,
  restApiNomenclatureAddCharacteristic: (materialUid: string) => `/api/nomenclature/${materialUid}/characteristics`,
  restApiNomenclatureUpdateCharacteristic: (uid: string) => `/api/nomenclature/characteristics/${uid}`,
  restApiNomenclatureDeleteCharacteristic: (uid: string) => `/api/nomenclature/characteristics/${uid}`,
  restApiNomenclatureTypeAttributes: '/api/nomenclature/type-attributes',
  restApiNomenclatureDocuments: (materialUid: string) => `/api/nomenclature/${materialUid}/documents`,
restApiNomenclatureDeleteDocument: (uid: string) => `/api/nomenclature/documents/${uid}`,
restApiNomenclatureSuppliersCRUD: '/api/nomenclature/suppliers',
restApiNomenclatureSupplier: (uid: string) => `/api/nomenclature/suppliers/${uid}`,
restApiNomenclatureSupply: (materialUid: string) => `/api/nomenclature/${materialUid}/supply`,
restApiNomenclatureDeleteSupply: (uid: string) => `/api/nomenclature/supply/${uid}`,
restApiNomenclatureAnalogs: (materialUid: string) => `/api/nomenclature/${materialUid}/analogs`,
restApiNomenclatureCalculateCompatibility: '/api/nomenclature/calculate-compatibility',
restApiNomenclatureDeleteAnalog: (uid: string) => `/api/nomenclature/analogs/${uid}`,
restApiNomenclatureRatings: (materialUid: string) => `/api/nomenclature/${materialUid}/ratings`,
restApiNomenclatureRatingsAverage: (materialUid: string) => `/api/nomenclature/${materialUid}/ratings/average`,
restApiNomenclatureDeleteRating: (uid: string) => `/api/nomenclature/ratings/${uid}`,
restApiNomenclatureIntegrations: (materialUid: string) => `/api/nomenclature/${materialUid}/integrations`,
restApiNomenclatureDeleteIntegration: (uid: string) => `/api/nomenclature/integrations/${uid}`,
// Добавить:
restApiNomenclatureCodes: (materialUid: string) => `/api/nomenclature/${materialUid}/codes`,
restApiNomenclatureDeleteCode: (uid: string) => `/api/nomenclature/codes/${uid}`,
restApiNomenclatureEvents: (materialUid: string) => `/api/nomenclature/${materialUid}/events`,
restApiSupplierGenerate: '/api/suppliers/generate',
restApiSupplierDraft: '/api/suppliers/draft',
restApiSuppliersList: '/api/suppliers',
restApiSupplierGet: (uid: string) => `/api/suppliers/${uid}`,
restApiSupplierDelete: (uid: string) => `/api/suppliers/${uid}`,
restApiSupplierImages: (supplierUid: string) => `/api/suppliers/${supplierUid}/images`,
restApiSupplierDeleteImage: (uid: string) => `/api/suppliers/images/${uid}`,
restApiSupplierDocuments: (supplierUid: string) => `/api/suppliers/${supplierUid}/documents`,
restApiSupplierDeleteDocument: (uid: string) => `/api/suppliers/documents/${uid}`,
restApiSupplierRatings: (supplierUid: string) => `/api/suppliers/${supplierUid}/ratings`,
restApiSupplierRatingsAverage: (supplierUid: string) => `/api/suppliers/${supplierUid}/ratings/average`,
restApiSupplierDeleteRating: (uid: string) => `/api/suppliers/ratings/${uid}`,
restApiSupplierIntegrations: (supplierUid: string) => `/api/suppliers/${supplierUid}/integrations`,
restApiSupplierDeleteIntegration: (uid: string) => `/api/suppliers/integrations/${uid}`,
restApiSupplierDescriptionTypes: '/api/suppliers/description-types',
restApiSupplierEvents: (supplierUid: string) => `/api/suppliers/${supplierUid}/events`,
// ConstantInfo.ts — добавить эндпоинты:
restApiSupplierDeliveries: (supplierUid: string) => `/api/suppliers/${supplierUid}/deliveries`,
restApiSupplierDeleteDelivery: (uid: string) => `/api/suppliers/deliveries/${uid}`,
restApiSupplierAssortment: (supplierUid: string) => `/api/suppliers/${supplierUid}/assortment`,
restApiTemplatesCategories: '/api/templates/categories',
restApiTemplatesCategory: (id: number) => `/api/templates/categories/${id}`,
restApiTemplates: '/api/templates',
restApiTemplate: (uid: string) => `/api/templates/${uid}`,
restApiTemplateCopy: '/api/templates/copy',
restApiTemplateStations: (uid: string) => `/api/templates/${uid}/stations`,
restApiEnterprises: '/api/enterprises',
restApiEnterprise: (id: number) => `/api/enterprises/${id}`,
// Workshops
restApiWorkshops: '/api/workshops',
restApiWorkshop: (id: number) => `/api/workshops/${id}`,
// Sections
restApiSections: '/api/sections',
restApiSection: (id: number) => `/api/sections/${id}`,
restApiStationTypes: '/api/station-types',
restApiStationType: (uid: string) => `/api/station-types/${uid}`,
// Station manufacturers
restApiStationManufacturers: '/api/station-manufacturers',
restApiStationManufacturer: (uid: string) => `/api/station-manufacturers/${uid}`,
// Station models
restApiStationModels: '/api/station-models',
restApiStationModel: (uid: string) => `/api/station-models/${uid}`,
restApiStationModelGenerateCode: '/api/station-models/generate-code',
restApiStationModelImages: (modelUid: string) => `/api/station-models/${modelUid}/images`,
restApiStationModelDeleteImage: (imageUid: string) => `/api/station-models/images/${imageUid}`,
restApiStationConfigurations: '/api/station-configurations',
restApiStationConfiguration: (uid: string) => `/api/station-configurations/${uid}`,
restApiStationConfigurationsByModel: (modelId: string) => `/api/station-configurations?modelId=${modelId}`,
restApiStationsCrud: '/api/stations/crud',
restApiStationsCrudGenerateCode: '/api/stations/crud/generate-code',
restApiStationCrud: (uid: string) => `/api/stations/crud/${uid}`,
restApiStationDocuments: (stationUid: string) => `/api/stations/${stationUid}/documents`,
restApiStationDeleteDocument: (stationUid: string, documentUid: string) => `/api/stations/${stationUid}/documents/${documentUid}`,
restApiHoldings: '/api/holdings',
  restApiOrdersActive: '/api/orders/active',
  restApiOrdersClosed: '/api/orders/closed',
  restApiOrderCreate: (orderUid: string) => `/api/orders/${orderUid}`,
  restApiOrderGet: (orderUid: string) => `/api/orders/${orderUid}`,
  restApiTkpActive: '/api/tkp/active',
restApiTkpClosed: '/api/tkp/closed',
restApiTkpGet: (tkpUid: string) => `/api/tkp/${tkpUid}`,
restApiOrderConduct: (orderUid: string) => `/api/orders/${orderUid}/conduct`,
restApiOrderSend: (orderUid: string) => `/api/orders/${orderUid}/send`,
restApiOrdersNotSent: '/api/orders/not-sent',
};

export default ConstantInfo;