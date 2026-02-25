/**
 * Milestone 1 Demo Component
 * This component demonstrates and tests the core infrastructure:
 * - Zustand store functionality
 * - Data conversion from existing format to slides
 * - Basic state management operations
 */

import { useEffect } from 'react';
import { useSlideStore } from '@/stores/slideStore';
import { convertExistingDataToSlides } from '@/lib/convertToSlides';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export function Milestone1Demo() {
  const { cards, addCard, removeCard, updateCard, selectCard, selectedCardId, theme } = useSlideStore();
  
  // Test data conversion on mount
  useEffect(() => {
    const mockData = {
      generatedIdea: {
        id: 1,
        programDescription: 'برنامج تدريبي لتأهيل الشباب',
        idea: 'فكرة البرنامج التدريبي',
        objective: 'تأهيل 100 شاب',
        justifications: 'الحاجة الملحة لتدريب الشباب',
        features: 'برنامج شامل ومتكامل',
        strengths: 'فريق متخصص وخبرة واسعة',
        outputs: 'شباب مؤهل للعمل',
        expectedResults: 'تحسين فرص التوظيف',
        vision: 'مجتمع شبابي منتج',
        selectedName: 'برنامج تأهيل الشباب',
      },
      showKPIs: true,
      kpisData: { kpis: [{ name: 'عدد المتدربين', target: '100' }] },
      showBudget: true,
      budgetData: { totalBudget: 50000, currency: 'ر.س' },
    };
    
    const slides = convertExistingDataToSlides(mockData);
    useSlideStore.getState().setCards(slides);
  }, []);
  
  const runTests = () => {
    console.log('🧪 Running Milestone 1 Tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Store initialization
    console.log('Test 1: Store has default theme');
    if (theme && theme.id === 'default') {
      console.log('✅ PASS: Default theme exists');
      passed++;
    } else {
      console.log('❌ FAIL: Default theme missing');
      failed++;
    }
    
    // Test 2: Data conversion
    console.log('\nTest 2: Data converted to slides');
    if (cards.length > 0) {
      console.log(`✅ PASS: ${cards.length} slides created`);
      passed++;
    } else {
      console.log('❌ FAIL: No slides created');
      failed++;
    }
    
    // Test 3: Cover slide exists
    console.log('\nTest 3: Cover slide created');
    const hasCover = cards.some(c => c.type === 'cover');
    if (hasCover) {
      console.log('✅ PASS: Cover slide exists');
      passed++;
    } else {
      console.log('❌ FAIL: Cover slide missing');
      failed++;
    }
    
    // Test 4: KPIs slide exists
    console.log('\nTest 4: KPIs slide created');
    const hasKPIs = cards.some(c => c.type === 'kpis');
    if (hasKPIs) {
      console.log('✅ PASS: KPIs slide exists');
      passed++;
    } else {
      console.log('❌ FAIL: KPIs slide missing');
      failed++;
    }
    
    // Test 5: Budget slide exists
    console.log('\nTest 5: Budget slide created');
    const hasBudget = cards.some(c => c.type === 'budget');
    if (hasBudget) {
      console.log('✅ PASS: Budget slide exists');
      passed++;
    } else {
      console.log('❌ FAIL: Budget slide missing');
      failed++;
    }
    
    // Test 6: Order is sequential
    console.log('\nTest 6: Slides have sequential order');
    const ordersCorrect = cards.every((card, index) => card.order === index);
    if (ordersCorrect) {
      console.log('✅ PASS: Order is sequential');
      passed++;
    } else {
      console.log('❌ FAIL: Order is not sequential');
      failed++;
    }
    
    // Test 7: Add card
    console.log('\nTest 7: Can add new card');
    const initialCount = cards.length;
    addCard({
      type: 'custom',
      title: 'Test Card',
      content: { text: 'Test' },
      style: {
        backgroundColor: '#ffffff',
        colorTheme: 'default',
        fullBleed: false,
        contentAlignment: 'top',
        showHeader: false,
        showFooter: false,
      },
    });
    const newCount = useSlideStore.getState().cards.length;
    if (newCount === initialCount + 1) {
      console.log('✅ PASS: Card added successfully');
      passed++;
      // Remove the test card
      const testCard = useSlideStore.getState().cards[newCount - 1];
      removeCard(testCard.id);
    } else {
      console.log('❌ FAIL: Card not added');
      failed++;
    }
    
    // Test 8: Select card
    console.log('\nTest 8: Can select card');
    if (cards.length > 0) {
      selectCard(cards[0].id);
      const selected = useSlideStore.getState().selectedCardId;
      if (selected === cards[0].id) {
        console.log('✅ PASS: Card selected');
        passed++;
      } else {
        console.log('❌ FAIL: Card not selected');
        failed++;
      }
    }
    
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    console.log(passed === 8 ? '🎉 All tests passed!' : '⚠️ Some tests failed');
    
    return { passed, failed };
  };
  
  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Milestone 1: Core Infrastructure - Test Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Store Status</h3>
              <p className="text-sm">Total Cards: {cards.length}</p>
              <p className="text-sm">Selected: {selectedCardId || 'None'}</p>
              <p className="text-sm">Theme: {theme.name}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-2">Card Types</h3>
              <p className="text-sm">Cover: {cards.filter(c => c.type === 'cover').length}</p>
              <p className="text-sm">KPIs: {cards.filter(c => c.type === 'kpis').length}</p>
              <p className="text-sm">Budget: {cards.filter(c => c.type === 'budget').length}</p>
              <p className="text-sm">Custom: {cards.filter(c => c.type === 'custom').length}</p>
            </div>
          </div>
          
          <Button onClick={runTests} className="w-full">
            Run Tests (Check Console)
          </Button>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Slide List</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cards.map((card, index) => (
                <div 
                  key={card.id}
                  className={`p-3 border rounded flex items-center justify-between ${
                    selectedCardId === card.id ? 'bg-blue-100 border-blue-500' : 'bg-white'
                  }`}
                  onClick={() => selectCard(card.id)}
                >
                  <div>
                    <span className="font-medium">#{index + 1}</span>
                    <span className="ml-2">{card.title}</span>
                    <span className="ml-2 text-xs text-gray-500">({card.type})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      card.style.colorTheme === 'blue' ? 'bg-blue-100' :
                      card.style.colorTheme === 'green' ? 'bg-green-100' :
                      card.style.colorTheme === 'purple' ? 'bg-purple-100' :
                      card.style.colorTheme === 'orange' ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      {card.style.colorTheme}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
