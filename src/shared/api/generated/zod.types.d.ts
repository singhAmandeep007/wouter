
  export namespace Schemas {
    // <Schemas>
  export type UserProfile = ({ id: string, name: string, email: string, loyaltyTier: ("bronze" | "silver" | "gold"), defaultPaymentMethod: string } & Record<string, unknown>)
/**
 * Editable fields of the user profile.
 */
export type UpdateUserProfileInput = Partial<{ name: string, email: string, defaultPaymentMethod: string }>
export type Product = ({ id: string, title: string, categoryId: string, price: number, stock: number, description: string } & Record<string, unknown>)
export type Category = ({ id: string, title: string } & Record<string, unknown>)
export type OrderItem = ({ id: string, productId: string, title: string, quantity: number, unitPrice: number } & Record<string, unknown>)
export type Order = ({ id: string, status: ("created" | "paid" | "shipped" | "delivered"), createdAt: string, totalAmount: number, items: Array<OrderItem> } & Record<string, unknown>)
export type DashboardSummary = ({ profile: UserProfile, openOrders: number, revenueMonth: number, lowStockProducts: Array<Product> } & Record<string, unknown>)
export type PaymentMethod = ({ id: string, type: ("card" | "upi" | "wallet"), label: string, isDefault: boolean } & Record<string, unknown>)
export type EnterpriseKpi = ({ activeTenants: number, apiRequestsPerMinute: number, slaPercent: number, unresolvedIncidents: number } & Record<string, unknown>)
export type RevenuePoint = ({ month: string, amount: number, region: ("apac" | "emea" | "amer") } & Record<string, unknown>)
export type IntegrationStatus = ({ id: string, name: string, owner: string, health: ("healthy" | "degraded" | "down"), latencyMs: number } & Record<string, unknown>)
export type ChatbotTranscript = ({ id: string, tenant: string, createdAt: string, tokens: number, channel: ("web" | "slack" | "teams") } & Record<string, unknown>)
export type ApiError = ({ message: string, code?: string } & Record<string, unknown>)

    // </Schemas>
    }
  
  export namespace Endpoints {
  // <Endpoints>
  
  export type get_GetDashboardSummary = {
      method: "GET",
      path: "/api/summary",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Schemas.DashboardSummary,
},
      
    }
export type get_GetUserProfile = {
      method: "GET",
      path: "/api/settings/profile",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Schemas.UserProfile,
},
      
    }
export type put_UpdateUserProfile = {
      method: "PUT",
      path: "/api/settings/profile",
      requestFormat: "json",
      responseFormat: "json",
      parameters: {
            
        
        
        
        body:  Schemas.UpdateUserProfileInput,
          }
      responses: {200: Schemas.UserProfile,
},
      
    }
export type get_ListPaymentMethods = {
      method: "GET",
      path: "/api/settings/payment-methods",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Array<Schemas.PaymentMethod>,
},
      
    }
export type get_ListCategories = {
      method: "GET",
      path: "/api/catalog/categories",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Array<Schemas.Category>,
},
      
    }
export type get_ListProducts = {
      method: "GET",
      path: "/api/catalog/products",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Array<Schemas.Product>,
},
      
    }
export type get_GetProductById = {
      method: "GET",
      path: "/api/catalog/products/{productId}",
      requestFormat: "json",
      responseFormat: "json",
      parameters: {
            
        path:  { productId: string },
        
        
        
          }
      responses: {200: Schemas.Product,
404: Schemas.ApiError,
},
      
    }
export type get_ListOrders = {
      method: "GET",
      path: "/api/orders",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Array<Schemas.Order>,
},
      
    }
export type get_GetOrderById = {
      method: "GET",
      path: "/api/orders/{orderId}",
      requestFormat: "json",
      responseFormat: "json",
      parameters: {
            
        path:  { orderId: string },
        
        
        
          }
      responses: {200: Schemas.Order,
404: Schemas.ApiError,
},
      
    }
export type get_GetEnterpriseKpi = {
      method: "GET",
      path: "/api/enterprise/kpi",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Schemas.EnterpriseKpi,
},
      
    }
export type get_GetEnterpriseRevenue = {
      method: "GET",
      path: "/api/enterprise/revenue",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Array<Schemas.RevenuePoint>,
},
      
    }
export type get_GetEnterpriseIntegrations = {
      method: "GET",
      path: "/api/enterprise/integrations",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Array<Schemas.IntegrationStatus>,
},
      
    }
export type get_GetChatbotTranscripts = {
      method: "GET",
      path: "/api/enterprise/chatbot/transcripts",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Array<Schemas.ChatbotTranscript>,
},
      
    }

  // </Endpoints>
  }
  
  
     // <EndpointByMethod>
     export type EndpointByMethod = {
     get: {
           "/api/summary": Endpoints.get_GetDashboardSummary,
"/api/settings/profile": Endpoints.get_GetUserProfile,
"/api/settings/payment-methods": Endpoints.get_ListPaymentMethods,
"/api/catalog/categories": Endpoints.get_ListCategories,
"/api/catalog/products": Endpoints.get_ListProducts,
"/api/catalog/products/{productId}": Endpoints.get_GetProductById,
"/api/orders": Endpoints.get_ListOrders,
"/api/orders/{orderId}": Endpoints.get_GetOrderById,
"/api/enterprise/kpi": Endpoints.get_GetEnterpriseKpi,
"/api/enterprise/revenue": Endpoints.get_GetEnterpriseRevenue,
"/api/enterprise/integrations": Endpoints.get_GetEnterpriseIntegrations,
"/api/enterprise/chatbot/transcripts": Endpoints.get_GetChatbotTranscripts
         },
put: {
           "/api/settings/profile": Endpoints.put_UpdateUserProfile
         }
     }
     
     // </EndpointByMethod>
     

    // <EndpointByMethod.Shorthands>
    export type GetEndpoints = EndpointByMethod["get"]
export type PutEndpoints = EndpointByMethod["put"]
    // </EndpointByMethod.Shorthands>
    