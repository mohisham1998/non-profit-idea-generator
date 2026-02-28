import { create } from 'zustand';
import { nanoid } from 'nanoid';

// Type definitions
export type CardType = 
  | 'cover'
  | 'kpis' 
  | 'budget' 
  | 'swot' 
  | 'logframe' 
  | 'timeline' 
  | 'pmdpro' 
  | 'designThinking' 
  | 'marketing'
  | 'custom';

export interface CardStyle {
  accentImage?: string;
  backgroundColor: string;
  backgroundImage?: string;
  colorTheme: 'default' | 'gray' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'rose' | 'midnight' | 'amber';
  fullBleed: boolean;
  contentAlignment: 'top' | 'center' | 'bottom';
  showHeader: boolean;
  showFooter: boolean;
  headerText?: string;
  footerText?: string;
  // Per-slide logo control
  showLogo?: boolean;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  logoSize?: 'small' | 'medium' | 'large';
  // Layout & visual customization
  layoutVariant?: 'cards' | 'list' | 'grid' | 'numbered' | 'quote' | 'timeline' | 'compact' | 'table';
  itemStyle?: 'numbered' | 'check' | 'arrow' | 'dot' | 'star' | 'card';
  textSize?: 'sm' | 'md' | 'lg';
}

export interface SlideCard {
  id: string;
  type: CardType;
  title: string;
  content: any; // Flexible content structure for different card types
  style: CardStyle;
  order: number;
  overrideTheme?: boolean; // If true, use card-specific styles instead of global theme
}

export interface PresentationTheme {
  id: string;
  name: string;
  logo?: string; // Logo image URL/path
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  logoSize: 'small' | 'medium' | 'large';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  // Global background for all slides
  globalBackgroundColor?: string;
  globalBackgroundImage?: string;
  applyGlobalBackground: boolean;
  coverSlide: {
    enabled: boolean;
    title: string;
    subtitle: string;
    backgroundImage?: string;
    backgroundColor: string;
    backgroundSize?: 'cover' | 'contain' | 'auto';
    backgroundPosition?: string;
    layout: 'centered' | 'left-aligned' | 'minimal' | 'bold';
  };
  applyLogoToAllSlides: boolean;
  applyThemeToAllSlides: boolean;
}

interface SlideStore {
  // State
  cards: SlideCard[];
  selectedCardId: string | null;
  theme: PresentationTheme;
  proposedNames: string[];
  presentationName: string;
  
  // Actions - Card Management
  addCard: (card: Omit<SlideCard, 'id' | 'order'>) => void;
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<SlideCard>) => void;
  reorderCards: (newOrder: SlideCard[]) => void;
  selectCard: (cardId: string | null) => void;
  
  // Actions - Card Style
  updateCardStyle: (cardId: string, styleUpdates: Partial<CardStyle>) => void;
  
  // Actions - Theme Management
  updateTheme: (themeUpdates: Partial<PresentationTheme>) => void;
  updateCoverSlide: (coverUpdates: Partial<PresentationTheme['coverSlide']>) => void;
  
  // Actions - Naming
  setProposedNames: (names: string[]) => void;
  setPresentationName: (name: string) => void;
  
  // Actions - Bulk Operations
  setCards: (cards: SlideCard[]) => void;
  clearCards: () => void;
  
  // Getters
  getCard: (cardId: string) => SlideCard | undefined;
  getSelectedCard: () => SlideCard | undefined;
}

// Default theme
const defaultTheme: PresentationTheme = {
  id: 'default',
  name: 'Default Theme',
  logoPosition: 'top-right',
  logoSize: 'medium',
  primaryColor: '#f97316', // Orange
  secondaryColor: '#f59e0b', // Amber
  accentColor: '#ea580c',
  fontFamily: 'Inter, sans-serif',
  applyGlobalBackground: false,
  coverSlide: {
    enabled: true,
    title: 'عنوان العرض التقديمي',
    subtitle: 'وصف مختصر للعرض',
    backgroundColor: '#ffffff',
    layout: 'centered',
  },
  applyLogoToAllSlides: true,
  applyThemeToAllSlides: true,
};

// Default card style
export const defaultCardStyle: CardStyle = {
  backgroundColor: '#ffffff',
  colorTheme: 'default',
  fullBleed: false,
  contentAlignment: 'top',
  showHeader: false,
  showFooter: false,
  showLogo: true, // defaults to showing logo (if theme has one)
  logoPosition: undefined, // undefined = use theme default
  logoSize: undefined, // undefined = use theme default
};

// Create the store
export const useSlideStore = create<SlideStore>((set, get) => ({
  // Initial state
  cards: [],
  selectedCardId: null,
  theme: defaultTheme,
  proposedNames: [],
  presentationName: 'عنوان العرض التقديمي',
  
  // Card Management Actions
  addCard: (card) => {
    const newCard: SlideCard = {
      ...card,
      id: nanoid(),
      order: get().cards.length,
      style: card.style || defaultCardStyle,
    };
    
    set((state) => ({
      cards: [...state.cards, newCard],
    }));
  },
  
  removeCard: (cardId) => {
    set((state) => ({
      cards: state.cards
        .filter((card) => card.id !== cardId)
        .map((card, index) => ({ ...card, order: index })),
      selectedCardId: state.selectedCardId === cardId ? null : state.selectedCardId,
    }));
  },
  
  updateCard: (cardId, updates) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId ? { ...card, ...updates } : card
      ),
    }));
  },
  
  reorderCards: (newOrder) => {
    set({
      cards: newOrder.map((card, index) => ({ ...card, order: index })),
    });
  },
  
  selectCard: (cardId) => {
    set({ selectedCardId: cardId });
  },
  
  // Card Style Actions
  updateCardStyle: (cardId, styleUpdates) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId
          ? { ...card, style: { ...card.style, ...styleUpdates } }
          : card
      ),
    }));
  },
  
  // Theme Management Actions
  updateTheme: (themeUpdates) => {
    set((state) => ({
      theme: { ...state.theme, ...themeUpdates },
    }));
  },
  
  updateCoverSlide: (coverUpdates) => {
    set((state) => ({
      theme: {
        ...state.theme,
        coverSlide: { ...state.theme.coverSlide, ...coverUpdates },
      },
    }));
  },
  
  // Naming Actions
  setProposedNames: (names) => {
    set({ proposedNames: names });
  },

  setPresentationName: (name) => {
    set((state) => ({
      presentationName: name,
      theme: {
        ...state.theme,
        coverSlide: { ...state.theme.coverSlide, title: name },
      },
    }));
    // Also update the cover card content if it exists
    const coverCard = get().cards.find(c => c.type === 'cover');
    if (coverCard) {
      set((state) => ({
        cards: state.cards.map(c =>
          c.type === 'cover'
            ? { ...c, title: name, content: { ...c.content, title: name } }
            : c
        ),
      }));
    }
  },

  // Bulk Operations
  setCards: (cards) => {
    set({ cards: cards.map((card, index) => ({ ...card, order: index })) });
  },
  
  clearCards: () => {
    set({ cards: [], selectedCardId: null });
  },
  
  // Getters
  getCard: (cardId) => {
    return get().cards.find((card) => card.id === cardId);
  },
  
  getSelectedCard: () => {
    const { cards, selectedCardId } = get();
    return cards.find((card) => card.id === selectedCardId);
  },
}));
