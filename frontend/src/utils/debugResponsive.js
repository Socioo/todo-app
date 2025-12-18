export const debugResponsive = () => {
  const logStyles = (element) => {
    if (!element) return;
    
    const styles = window.getComputedStyle(element);
    console.log('Element:', element.tagName, element.className);
    console.log('Width:', styles.width);
    console.log('Height:', styles.height);
    console.log('Display:', styles.display);
    console.log('Flex:', styles.flex);
    console.log('---');
  };

  // Check key elements
  const elements = [
    document.querySelector('.todo-list'),
    document.querySelector('.todo-item'),
    document.querySelector('.todo-content'),
    document.querySelector('.add-todo-form'),
  ];

  elements.forEach(logStyles);
  
  console.log('Window width:', window.innerWidth);
  console.log('Viewport:', window.visualViewport?.width);
};

// Add to TodoList component for debugging
// useEffect(() => {
//   debugResponsive();
// }, [isMobile, todos]);