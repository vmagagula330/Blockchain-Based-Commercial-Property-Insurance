import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity contract environment
const mockClarity = {
  properties: new Map(),
  lastPropertyId: 0,
  txSender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  blockHeight: 100,
  blockTime: 1617984000,
  
  // Mock functions
  registerProperty(address, buildingType, squareFootage, yearBuilt, valuation) {
    const newId = this.lastPropertyId + 1
    this.properties.set(newId, {
      owner: this.txSender,
      address,
      buildingType,
      squareFootage,
      yearBuilt,
      valuation,
      registrationDate: this.blockTime,
    })
    this.lastPropertyId = newId
    return { success: true, value: newId }
  },
  
  getProperty(propertyId) {
    return this.properties.get(propertyId)
  },
  
  updateValuation(propertyId, newValuation) {
    const property = this.properties.get(propertyId)
    if (!property) return { success: false, error: 1 }
    if (property.owner !== this.txSender) return { success: false, error: 2 }
    
    property.valuation = newValuation
    this.properties.set(propertyId, property)
    return { success: true, value: true }
  },
}

describe("Property Registration Contract", () => {
  beforeEach(() => {
    mockClarity.properties.clear()
    mockClarity.lastPropertyId = 0
  })
  
  it("should register a new property", () => {
    const result = mockClarity.registerProperty("123 Main St", "commercial", 5000, 2010, 1000000)
    
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
    
    const property = mockClarity.getProperty(1)
    expect(property).toBeDefined()
    expect(property.address).toBe("123 Main St")
    expect(property.buildingType).toBe("commercial")
    expect(property.squareFootage).toBe(5000)
    expect(property.yearBuilt).toBe(2010)
    expect(property.valuation).toBe(1000000)
    expect(property.owner).toBe(mockClarity.txSender)
  })
  
  it("should update property valuation", () => {
    // First register a property
    mockClarity.registerProperty("123 Main St", "commercial", 5000, 2010, 1000000)
    
    // Then update its valuation
    const result = mockClarity.updateValuation(1, 1200000)
    
    expect(result.success).toBe(true)
    
    const property = mockClarity.getProperty(1)
    expect(property.valuation).toBe(1200000)
  })
  
  it("should fail to update valuation for non-existent property", () => {
    const result = mockClarity.updateValuation(999, 1200000)
    expect(result.success).toBe(false)
    expect(result.error).toBe(1)
  })
  
  it("should fail to update valuation for property owned by someone else", () => {
    // Register a property
    mockClarity.registerProperty("123 Main St", "commercial", 5000, 2010, 1000000)
    
    // Change the tx-sender
    const originalSender = mockClarity.txSender
    mockClarity.txSender = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    
    // Try to update valuation
    const result = mockClarity.updateValuation(1, 1200000)
    
    expect(result.success).toBe(false)
    expect(result.error).toBe(2)
    
    // Restore the original sender
    mockClarity.txSender = originalSender
  })
})
