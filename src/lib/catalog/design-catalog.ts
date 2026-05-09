import type {
  BudgetTier,
  DesignCatalogItem,
  DesignConstraint,
  DesignGoal,
  DesignStyle,
} from "@/lib/types/room-remix";

export const designCatalog: DesignCatalogItem[] = [
  {
    id: "lamp-paper-floor",
    name: "Paper Floor Lamp",
    category: "lamp",
    compatibleStyles: ["Japandi", "Minimal", "Warm Modern"],
    priceTier: "Medium",
    materials: ["paper shade", "wood base"],
    visualEffect: "soft diffuse glow",
    placementSuggestions: ["D3", "near reading corner", "beside bed path"],
    constraintsCompatibility: ["Rental-friendly", "No drilling"],
  },
  {
    id: "lamp-black-arc",
    name: "Black Arc Lamp",
    category: "lamp",
    compatibleStyles: ["Industrial", "Warm Modern", "Minimal"],
    priceTier: "High",
    materials: ["metal", "matte black finish"],
    visualEffect: "graphic statement lighting",
    placementSuggestions: ["D3", "beside desk", "over rug zone"],
    constraintsCompatibility: ["Rental-friendly"],
  },
  {
    id: "rug-jute-neutral",
    name: "Jute Neutral Rug",
    category: "rug",
    compatibleStyles: ["Japandi", "Bohemian", "Warm Modern"],
    priceTier: "Medium",
    materials: ["jute", "natural fibers"],
    visualEffect: "adds warmth and texture",
    placementSuggestions: ["C2-D3", "under front half of bed"],
    constraintsCompatibility: ["Pet-safe", "Rental-friendly"],
  },
  {
    id: "rug-geometric-low-pile",
    name: "Geometric Low-Pile Rug",
    category: "rug",
    compatibleStyles: ["Industrial", "Minimal", "Warm Modern"],
    priceTier: "Low",
    materials: ["synthetic low-pile fibers"],
    visualEffect: "adds structure without visual clutter",
    placementSuggestions: ["C2-D3", "desk-side floor zone"],
    constraintsCompatibility: ["Pet-safe", "Rental-friendly"],
  },
  {
    id: "decor-framed-abstract",
    name: "Framed Abstract Art",
    category: "wall_decor",
    compatibleStyles: ["Minimal", "Warm Modern", "Industrial"],
    priceTier: "Medium",
    materials: ["paper print", "wood frame"],
    visualEffect: "creates focal point above furniture",
    placementSuggestions: ["A2-A3", "above bed", "above desk"],
    constraintsCompatibility: ["Rental-friendly"],
  },
  {
    id: "decor-round-mirror",
    name: "Round Mirror",
    category: "wall_decor",
    compatibleStyles: ["Japandi", "Warm Modern", "Bohemian"],
    priceTier: "High",
    materials: ["glass", "thin metal or wood frame"],
    visualEffect: "reflects light and opens the room",
    placementSuggestions: ["A2-A3", "above bed if mounting is allowed"],
    constraintsCompatibility: ["Rental-friendly"],
  },
  {
    id: "plant-tall-floor",
    name: "Tall Floor Plant",
    category: "plant",
    compatibleStyles: ["Bohemian", "Japandi", "Warm Modern"],
    priceTier: "Medium",
    materials: ["ceramic planter", "green foliage"],
    visualEffect: "adds height and organic shape",
    placementSuggestions: ["D3", "near window", "empty corner"],
    constraintsCompatibility: ["Rental-friendly"],
  },
  {
    id: "textile-linen-bedding",
    name: "Linen Bedding",
    category: "textile",
    compatibleStyles: ["Minimal", "Japandi", "Warm Modern"],
    priceTier: "Medium",
    materials: ["linen", "cotton"],
    visualEffect: "softens the bed and adds relaxed texture",
    placementSuggestions: ["B2-C3", "main bed"],
    constraintsCompatibility: ["Keep existing furniture", "Rental-friendly"],
  },
];

export interface CatalogFilter {
  style?: DesignStyle;
  budget?: BudgetTier;
  goal?: DesignGoal;
  constraints?: DesignConstraint[];
  category?: DesignCatalogItem["category"];
}

export function getGenericCatalogOptions(filter: CatalogFilter = {}) {
  return designCatalog.filter((item) => {
    const matchesStyle = filter.style
      ? item.compatibleStyles.includes(filter.style)
      : true;
    const matchesBudget = filter.budget
      ? priceAllowed(item.priceTier, filter.budget)
      : true;
    const matchesCategory = filter.category ? item.category === filter.category : true;
    const matchesConstraints = filter.constraints?.length
      ? filter.constraints.every((constraint) =>
          item.constraintsCompatibility.includes(constraint),
        )
      : true;

    return matchesStyle && matchesBudget && matchesCategory && matchesConstraints;
  });
}

function priceAllowed(itemTier: BudgetTier, selectedBudget: BudgetTier) {
  const rank: Record<BudgetTier, number> = {
    Low: 1,
    Medium: 2,
    High: 3,
  };

  return rank[itemTier] <= rank[selectedBudget];
}

