const postSaleToServer = async (sale) => {
    try {
      await API.post('sales', { ...sale });
      console.log('Sale Synced:', sale);
    } catch (err) {
      throw new Error(err.response.data.message);
    }
  };
  
  // Function to store sale locally
  const storeSaleLocally = async (sale) => {
    const db = await openIndexedDB('localdb', 1, [{ name: 'sales', keyPath: 'id', autoIncrement: true }]);
    await addData(db, 'sales', sale);
  };
  
  // Function to sync sales
  const syncSale = async (saleToSync = null) => {
    const db = await openIndexedDB('localdb', 1, [{ name: 'sales', keyPath: 'id', autoIncrement: true }]);
    if (saleToSync) {
      // Try to sync the sale immediately if the network is available
      try {
        await postSaleToServer(saleToSync);
      } catch (err) {
        alert(`Sync failed, storing sale locally: ${err.message}`);
        await storeSaleLocally(saleToSync);
      }
    } else {
      // If no specific sale, try to sync all locally stored sales
      const unsyncedSales = await getAllData(db, 'sales');
      if (unsyncedSales.length > 0) {
        unsyncedSales.forEach(async (localSale) => {
          try {
            await postSaleToServer(localSale);
            // Remove the synced sale from IndexedDB
            await deleteData(db, 'sales', localSale.id);
          } catch (err) {
            console.error('Sync failed for sale:', localSale, err.message);
          }
        });
      }
    }
  };
  
  // Function to create a sale
  const createSale = async () => {
    const soldProducts = getValues('products').map(item => ({
      ...item,
      quantity: item.quantity,
      totalProductPrice: item.quantity * item.sellingPrice * (item?.discount?.value ? (100 - item.discount.value) / 100 : 1),
      totalProductCost: item.quantity * item.costPrice
    }));
  
    const sale = {
      shopId,
      products: soldProducts,
      staffId: getUserId(),
    };
  
    if (Object.keys(discount).length) {
      sale.discount = discount;
    }
    if (Object.keys(bill).length) {
      sale.bill = bill;
    }
    if (source.length) {
      sale.source = source;
    }
  
    try {
      setIsloading(true);
      await postSaleToServer(sale);
      setIsloading(false);
      setFormState('list');
    } catch (err) {
      setIsloading(false);
      const {message} = err;
      setError(message);
      await storeSaleLocally(sale);
    }
  };
  
  const watchedProduct = watch('products')
  
  
  // Hook to sync sales when the network is back online
  const useSyncSales = () => {
    useEffect(() => {
      const handleOnline = () => {
        syncSale();
      };
  
      window.addEventListener('online', handleOnline);
  
      // Cleanup the event listener on component unmount
      return () => {
        window.removeEventListener('online', handleOnline);
      };
    }, []);
  };
  
  const handleSale = async () => {
    try {
      setIsloading(true);
      await createSale();
      setIsloading(false);
    } catch (err) {
      setIsloading(false);
      setError(err.message);
    }
  };
  
  useSyncSales();