import React from 'react';
import { Table, Button, Image, Typography, Rate, Empty, Tooltip } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import '../style/CompareProducts.css';

const { Title, Text } = Typography;

const CompareProducts = () => {
  const { compareItems, removeFromCompare } = useCompare();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (compareItems.length === 0) {
    return (
      <div className="compare-empty-container">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text>{t('no_products_to_compare') || "Chưa có sản phẩm nào để so sánh"}</Text>
          }
        >
          <Button type="primary" onClick={() => navigate('/products')}>
            {t('continue_shopping') || "Tiếp tục mua sắm"}
          </Button>
        </Empty>
      </div>
    );
  }

  const columns = [
    {
      title: '',
      dataIndex: 'attribute',
      key: 'attribute',
      width: 200,
      fixed: 'left',
      render: (text) => <Text strong>{text}</Text>,
    },
    ...compareItems.map(product => ({
      title: (
        <div className="compare-header-cell">
          <div className="compare-actions">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => removeFromCompare(product.id)}
            >
              {t('remove') || "Xóa"}
            </Button>
          </div>
          <Image src={product.thumbnail} width={120} height={120} objectFit="contain" />
          <div className="product-name-link" onClick={() => navigate(`/product/${product.id}`)}>
            <Text strong ellipsis style={{ maxWidth: 200, display: 'block' }}>{product.title}</Text>
          </div>
          <Tooltip title={t('add_to_cart') || "Thêm vào giỏ"}>
            <Button 
              type="text" 
              shape="circle"
              icon={<ShoppingCartOutlined style={{ fontSize: '28px', color: '#1890ff' }} />} 
              onClick={() => addToCart(product)}
              className="compare-add-to-cart-btn"
            />
          </Tooltip>
        </div>
      ),
      dataIndex: product.id,
      key: product.id,
      width: 250,
      align: 'center',
    })),
  ];

  const data = [
    {
      key: 'price',
      attribute: t('price') || 'Giá',
      ...compareItems.reduce((acc, item) => ({ ...acc, [item.id]: <Text type="danger" strong>${item.price}</Text> }), {}),
    },
    {
      key: 'rating',
      attribute: t('rating') || 'Đánh giá',
      ...compareItems.reduce((acc, item) => ({ ...acc, [item.id]: <Rate disabled defaultValue={item.rating} allowHalf style={{ fontSize: 12 }} /> }), {}),
    },
    {
      key: 'brand',
      attribute: t('brand') || 'Thương hiệu',
      ...compareItems.reduce((acc, item) => ({ ...acc, [item.id]: item.brand || '-' }), {}),
    },
    {
      key: 'category',
      attribute: t('category') || 'Danh mục',
      ...compareItems.reduce((acc, item) => ({ ...acc, [item.id]: item.category || '-' }), {}),
    },
    {
      key: 'stock',
      attribute: t('stock') || 'Tình trạng kho',
      ...compareItems.reduce((acc, item) => ({ 
        ...acc, 
        [item.id]: (item.stock > 0 ? <Text type="success">{t('in_stock') || "Còn hàng"}</Text> : <Text type="danger">{t('out_of_stock') || "Hết hàng"}</Text>) 
      }), {}),
    },
    {
      key: 'description',
      attribute: t('description') || 'Mô tả',
      ...compareItems.reduce((acc, item) => ({ 
        ...acc, 
        [item.id]: <div className="compare-description">{item.description}</div> 
      }), {}),
    },
  ];

  return (
    <div className="compare-page-container">
      <div className="compare-header">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 16 }}>
          {t('back') || "Quay lại"}
        </Button>
        <Title level={2} style={{ margin: 0 }}>{t('compare_products_title') || "So sánh sản phẩm"}</Title>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false} 
        bordered
        scroll={{ x: 'max-content' }}
        className="compare-table"
      />
    </div>
  );
};

export default CompareProducts;
