import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tabs, Layout, Typography, Table, Tag, Space, Card, Row, Col, Input,
  Button, Modal, Form, message, Switch, Alert, Select,
  List, Avatar, Tooltip // <--- Các imports cơ bản
} from 'antd';
// Đảm bảo bạn đã import các file này từ đúng đường dẫn
import { getStoredBlogPosts, saveStoredBlogPosts, BLOG_STORAGE_KEY } from '../Blog';
import { getStoredSupportTickets, updateSupportTicket, getStoredStaffs } from '../../API';

import {
  ReloadOutlined, PlusOutlined, ClockCircleOutlined, SolutionOutlined,
  AlertOutlined, EditOutlined, BookOutlined, SettingOutlined, UserOutlined,
  DeleteOutlined, SaveOutlined, LineChartOutlined,
  EyeOutlined, LikeOutlined, MessageOutlined,
  AppstoreOutlined, BarsOutlined, PushpinOutlined // <-- (MỚI) Thêm icon cho 2 tính năng mới
} from '@ant-design/icons'; // <-- (MỚI) Thêm icon cho 2 tính năng mới
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title as ChartTitle, Tooltip as ChartTooltip, Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, ChartTooltip, Legend);

const { Content } = Layout;
const { Title, Text } = Typography;
// Small util: responsive width hook
const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};
const { Search } = Input;
const GRADIENT_BUTTON_STYLE = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  color: '#fff'
};
const MOCK_CURRENT_USER = 'Doãn Bá Min';
const currentTimestamp = Date.now();
const mockTickets = [
  { key: '1001', id: '#1001', title: 'Lỗi không áp dụng mã giảm giá', status: 'Đang Xử lý', priority: 'TRUNG BÌNH', customer: 'Nguyễn Văn A', assigned: 'Chưa gán', updated: currentTimestamp - 30 * 60 * 1000, source: 'Form Web', SLA_due: currentTimestamp + 60 * 60 * 1000 },
  { key: '1002', id: '#1002', title: 'Thắc mắc về chính sách đổi hàng', status: 'Mới', priority: 'TRUNG BÌNH', customer: 'Lê Thị C', assigned: 'Chưa gán', updated: currentTimestamp - 7200000, source: 'Email', SLA_due: currentTimestamp + 3600000 },
  { key: '1003', id: '#1003', title: 'Không nhận được email xác nhận đơn hàng', status: 'Chờ Phản hồi', priority: 'CAO', customer: 'Phạm Văn D', assigned: 'Nguyễn K', updated: currentTimestamp - 24 * 3600 * 1000, source: 'Email', SLA_due: currentTimestamp - 1000 },
  { key: '1004', id: '#1004', title: 'Yêu cầu xuất hóa đơn VAT', status: 'Đã Đóng', priority: 'THẤP', customer: 'Hoàng Thị E', assigned: 'Trần B', updated: currentTimestamp - 3 * 24 * 3600 * 1000, source: 'Form Web', SLA_due: currentTimestamp + 7 * 24 * 3600 * 1000 },
  { key: '1005', id: '#1005', title: 'Đơn hàng bị giao thiếu sản phẩm', status: 'Mới', priority: 'CAO', customer: 'Trần Q', assigned: 'Chưa gán', updated: currentTimestamp - 10000, source: 'Form Web', SLA_due: currentTimestamp + 30 * 60 * 1000 },
];
const mockAutomationRules = [
  { key: 1, name: 'Tự động gán Ticket Thanh toán', condition: 'Tiêu đề chứa "Thanh toán"', action: 'Gán cho Trần B', enabled: true },
  { key: 2, name: 'Phân loại Khẩn cấp', condition: 'Nguồn là "Form Khẩn cấp"', action: 'Đặt Ưu tiên CAO', enabled: true },
];
const getStatusTag = (status, t) => {
  switch (status) {
    case 'Mới': return <Tag color="blue">{t('help_status_new')}</Tag>;
    case 'Đang Xử lý': return <Tag color="gold">{t('help_status_in_progress')}</Tag>;
    case 'Chờ Phản hồi': return <Tag color="processing">{t('help_status_pending')}</Tag>;
    case 'Đã Đóng': return <Tag color="green">{t('help_status_closed')}</Tag>;
    default: return <Tag>{status}</Tag>;
  }
};
const getPriorityTag = (priority, t) => {
  switch (priority) {
    case 'CAO': return <Tag color="red" icon={<AlertOutlined />}>{t('help_priority_high')}</Tag>;
    case 'TRUNG BÌNH': return <Tag color="orange">{t('help_priority_medium')}</Tag>;
    default: return <Tag color="default">{t('help_priority_low')}</Tag>;
  }
};
const isSlaBreached = (slaDueTimestamp) => {
  return slaDueTimestamp < Date.now();
}
const applyAutomationRules = (rawTickets) => {
  return rawTickets.map(ticket => {
    let updatedTicket = { ...ticket };
    if (updatedTicket.assigned === 'Chưa gán' && updatedTicket.title.toLowerCase().includes('thanh toán')) {
      updatedTicket.assigned = 'Trần B';
      updatedTicket.status = 'Đang Xử lý';
    }
    if (updatedTicket.status === 'Mới' && updatedTicket.source === 'Form Web' && updatedTicket.priority === 'TRUNG BÌNH') {
      updatedTicket.priority = 'CAO';
    }
    return updatedTicket;
  });
};

const TicketManagementTab = ({ onTicketsLoaded }) => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState(mockTickets);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createTicketForm] = Form.useForm();
  const [processedAllTickets, setProcessedAllTickets] = useState([]);
  const [tableFilters, setTableFilters] = useState({});
  const applyFiltersAndSearch = useCallback((data, filtersObj, keyword) => {
    let out = (data || []).filter(t =>
      t.title.toLowerCase().includes((keyword || '').toLowerCase()) ||
      t.customer.toLowerCase().includes((keyword || '').toLowerCase())
    );
    if (filtersObj && filtersObj.status && filtersObj.status.length) {
      out = out.filter(x => filtersObj.status.includes(x.status));
    }
    if (filtersObj && filtersObj.priority && filtersObj.priority.length) {
      out = out.filter(x => filtersObj.priority.includes(x.priority));
    }
    return out;
  }, []);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailForm] = Form.useForm();
  const [staffOptions, setStaffOptions] = useState([]);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      let stored = [];
      try { stored = getStoredSupportTickets() || []; } catch (e) { stored = []; }
      const storedNormalized = (stored || []).map(s => ({
        key: s.key || `${s.id}`,
        id: s.id,
        title: s.title || s.description || 'Contact',
        status: s.status || 'Mới',
        priority: s.priority || 'TRUNG BÌNH',
        customer: s.customer || 'Guest',
        assigned: s.assigned || 'Chưa gán',
        updated: s.updated || Date.now(),
        source: s.source || 'Contact Form',
        SLA_due: s.SLA_due || (Date.now() + 6 * 3600000),
        description: s.description || '',
      }));
      let processedData = applyAutomationRules([...storedNormalized, ...mockTickets]);
      setProcessedAllTickets(processedData);

      if (onTicketsLoaded) {
        onTicketsLoaded(processedData);
      }

      const filtered = applyFiltersAndSearch(processedData, tableFilters, searchKeyword);
      setTickets(filtered);
      setLoading(false);
      message.success(`${t('help_btn_reload_rules')}: ${filtered.length} Tickets`);
    }, 500);
  }, [searchKeyword, t, tableFilters, applyFiltersAndSearch, onTicketsLoaded]);

  useEffect(() => {
    fetchTickets();
    const onSupportUpdated = () => fetchTickets();
    window.addEventListener('support_tickets_updated', onSupportUpdated);
    const onStorage = (ev) => { if (ev.key === 'support_tickets') fetchTickets(); };
    window.addEventListener('storage', onStorage);
    const loadStaffs = () => {
      try {
        const staffList = getStoredStaffs() || [];
        const active = (staffList || []).filter(s => s.status !== 'deleted' && s.status !== 'inactive');
        setStaffOptions(active.map(s => ({ id: s.id, name: s.fullName })));
      } catch (e) { setStaffOptions([]); }
    };
    loadStaffs();
    const onStaffStorage = (ev) => { if (ev.key === 'app_staffs_v1') loadStaffs(); };
    window.addEventListener('storage', onStaffStorage);

    return () => {
      window.removeEventListener('support_tickets_updated', onSupportUpdated);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('storage', onStaffStorage);
    };
  }, [fetchTickets]);

  const handleCreateTicket = () => {
    createTicketForm.validateFields().then(values => {
      const newTicket = {
        key: `${Date.now()}`,
        id: `#${1000 + tickets.length + 1}`,
        title: values.title,
        status: 'Mới',
        priority: values.priority,
        customer: values.customer,
        assigned: values.assigned || 'Chưa gán',
        updated: Date.now(),
        source: values.source,
        SLA_due: Date.now() + (values.priority === 'CAO' ? 2 * 3600000 : values.priority === 'TRUNG BÌNH' ? 6 * 3600000 : 24 * 3600000),
      };
      setTickets([newTicket, ...tickets]);
      message.success(t('help_msg_ticket_created', { id: newTicket.id }));
      setIsCreateModalVisible(false);
      createTicketForm.resetFields();
    }).catch(err => {
      console.error('Validation failed:', err);
    });
  };
  const columns = [
    { title: t('help_col_id'), dataIndex: 'id', key: 'id' },
    {
      title: t('help_col_title'),
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => {
        const slaBreached = isSlaBreached(record.SLA_due);
        return (
          <Space direction="vertical" size={0}>
            <Text>{text}</Text>
            {slaBreached && (
              <Tag color="error" icon={<ClockCircleOutlined />} style={{ marginTop: 4 }}>
                {t('help_tag_sla_breached')}
              </Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: t('help_col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status, t),
      filters: [
        { text: 'Mới', value: 'Mới' },
        { text: 'Đang Xử lý', value: 'Đang Xử lý' },
        { text: 'Chờ Phản hồi', value: 'Chờ Phản hồi' },
        { text: 'Đã Đóng', value: 'Đã Đóng' },
      ],
    },
    {
      title: t('help_col_priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority, t),
      sorter: (a, b) => a.priority.localeCompare(b.priority),
      filters: [
        { text: 'CAO', value: 'CAO' },
        { text: 'TRUNG BÌNH', value: 'TRUNG BÌNH' },
        { text: 'THẤP', value: 'THẤP' },
      ],
    },
    { title: t('help_col_customer'), dataIndex: 'customer', key: 'customer' },
    {
      title: t('help_col_assigned'),
      dataIndex: 'assigned',
      key: 'assigned',
      render: (assigned) => assigned === MOCK_CURRENT_USER ? <Tag color="volcano"><UserOutlined /> {t('help_tag_assigned_mine')}</Tag> : assigned
    },
    { title: t('help_col_updated'), dataIndex: 'updated', key: 'updated', render: (timestamp) => `${Math.floor((Date.now() - timestamp) / 60000)} phút trước` },
    {
      title: t('help_col_actions'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button size="small" type="link" onClick={() => showDetailModal(record)}>{t('help_action_details')}</Button>
          <Button size="small" type="link" danger onClick={async () => {
            try {
              await updateSupportTicket(record.key || record.id, { status: 'Đã Đóng' });
              message.success(t('help_msg_ticket_closed', { id: record.id }));
              fetchTickets();
            } catch (e) {
              console.error('Close ticket failed', e);
              message.error(t('help_msg_ticket_close_failed'));
            }
          }}>{t('help_action_close')}</Button>
        </Space>
      ),
    },
  ];
  const handleTableChange = (pagination, filters, sorter) => {
    setTableFilters(filters || {});
    try {
      const visible = applyFiltersAndSearch(processedAllTickets, filters || {}, searchKeyword);
      setTickets(visible);
    } catch (e) {
      setTableFilters(filters || {});
    }
  };
  const showDetailModal = (record) => {
    setSelectedTicket(record);
    detailForm.setFieldsValue({
      assigned: record.assigned === 'Chưa gán' ? '' : record.assigned,
      status: record.status,
    });
    setIsDetailModalVisible(true);
  };
  const allProcessedTickets = processedAllTickets || [];
  const newTicketsCount = allProcessedTickets.filter(t => t.status === 'Mới').length;
  const inProgressTicketsCount = allProcessedTickets.filter(t => t.status === 'Đang Xử lý').length;
  const pendingTicketsCount = allProcessedTickets.filter(t => t.status === 'Chờ Phản hồi').length;
  const totalHighPriority = allProcessedTickets.filter(t => t.priority === 'CAO').length;

  const width = useWindowWidth();
  const isMobile = width < 768;

  return (
    <>
      <Alert
        message={<Text strong>{t('help_dashboard_welcome', { user: MOCK_CURRENT_USER, count: allProcessedTickets.length })}</Text>}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
          <Card className="help-summary-card help-summary-card-mini" bordered={false} hoverable style={{ "--accent-color": '#1890ff' }}>
            <div className="summary-inner">
              <div className="summary-icon"><AlertOutlined /></div>
              <div className="summary-number">{newTicketsCount}</div>
              <div className="summary-progress"><div className="summary-progress-fill" style={{ width: `${Math.round((newTicketsCount / Math.max(1, Math.max(newTicketsCount, inProgressTicketsCount, pendingTicketsCount, totalHighPriority))) * 100)}%` }} /></div>
              <div className="summary-label">Ticket Mới</div>
            </div>
          </Card>
        </Col>
          <Col xs={24} sm={12} md={6}>
          <Card className="help-summary-card help-summary-card-mini" bordered={false} hoverable style={{ "--accent-color": '#faad14' }}>
            <div className="summary-inner">
              <div className="summary-icon"><SolutionOutlined /></div>
              <div className="summary-number">{inProgressTicketsCount}</div>
              <div className="summary-progress"><div className="summary-progress-fill" style={{ width: `${Math.round((inProgressTicketsCount / Math.max(1, Math.max(newTicketsCount, inProgressTicketsCount, pendingTicketsCount, totalHighPriority))) * 100)}%` }} /></div>
              <div className="summary-label">Đang Xử lý</div>
            </div>
          </Card>
        </Col>
          <Col xs={24} sm={12} md={6}>
          <Card className="help-summary-card help-summary-card-mini" bordered={false} hoverable style={{ "--accent-color": '#52c41a' }}>
            <div className="summary-inner">
              <div className="summary-icon"><ClockCircleOutlined /></div>
              <div className="summary-number">{pendingTicketsCount}</div>
              <div className="summary-progress"><div className="summary-progress-fill" style={{ width: `${Math.round((pendingTicketsCount / Math.max(1, Math.max(newTicketsCount, inProgressTicketsCount, pendingTicketsCount, totalHighPriority))) * 100)}%` }} /></div>
              <div className="summary-label">TB Phản hồi</div>
            </div>
          </Card>
        </Col>
          <Col xs={24} sm={12} md={6}>
          <Card className="help-summary-card help-summary-card-mini" bordered={false} hoverable style={{ "--accent-color": '#f5222d' }}>
            <div className="summary-inner">
              <div className="summary-icon"><AlertOutlined /></div>
              <div className="summary-number">{totalHighPriority}</div>
              <div className="summary-progress"><div className="summary-progress-fill" style={{ width: `${Math.round((totalHighPriority / Math.max(1, Math.max(newTicketsCount, inProgressTicketsCount, pendingTicketsCount, totalHighPriority))) * 100)}%` }} /></div>
              <div className="summary-label">Khẩn cấp</div>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)} style={GRADIENT_BUTTON_STYLE}>{t('help_btn_create_manual')}</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchTickets} loading={loading}>{t('help_btn_reload_rules')}</Button>
          </Space>
          <div style={{ flex: isMobile ? '1 1 100%' : '0 1 auto', display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
            <Search
              placeholder={t('help_search_ticket_placeholder')}
              onSearch={setSearchKeyword}
              style={{ width: isMobile ? '100%' : 300 }}
              enterButton
            />
          </div>
      </div>
      {isMobile ? (
        <List
          dataSource={tickets}
          split={false}
          renderItem={(tRecord) => (
            <List.Item>
              <Card className="help-ticket-card" style={{ width: '100%' }}>
                <div className="ticket-meta" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="ticket-left" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="ticket-top"><Text strong className="ticket-id">{tRecord.id}</Text> <Text type="secondary">{tRecord.customer}</Text></div>
                    <div className="ticket-title" style={{ fontWeight: 600 }}>{tRecord.title}</div>
                    <div className="ticket-tags" style={{ marginTop: 6 }}>
                      <Space size="small">{getStatusTag(tRecord.status, t)}{getPriorityTag(tRecord.priority, t)}</Space>
                    </div>
                  </div>
                  <div className="ticket-right" style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Text type="secondary" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{`${Math.floor((Date.now() - tRecord.updated) / 60000)} phút`}</Text>
                    <div className="ticket-actions">
                      <Button type="text" size="small" shape="circle" icon={<EyeOutlined />} onClick={() => showDetailModal(tRecord)} />
                      <Button type="text" size="small" shape="circle" icon={<EditOutlined />} onClick={() => showDetailModal(tRecord)} />
                      <Button type="text" size="small" shape="circle" icon={<DeleteOutlined />} danger onClick={async () => {
                        try {
                          await updateSupportTicket(tRecord.key || tRecord.id, { status: 'Đã Đóng' });
                          message.success(t('help_msg_ticket_closed', { id: tRecord.id }));
                          fetchTickets();
                        } catch (e) {
                          console.error('Close ticket failed', e);
                          message.error(t('help_msg_ticket_close_failed'));
                        }
                      }} />
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={tickets}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          onChange={handleTableChange}
        />
      )}

      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              {t('help_modal_create_ticket_title')}
            </span>
          </Space>
        }
        open={isCreateModalVisible}
        onOk={handleCreateTicket}
        onCancel={() => {
          setIsCreateModalVisible(false);
          createTicketForm.resetFields();
        }}
        width={isMobile ? '94%' : 700}
        okText={t('help_modal_create_ticket_ok')}
        cancelText={t('help_modal_create_ticket_cancel')}
        okButtonProps={{ icon: <PlusOutlined /> }}
      >
        <Alert
          message={t('help_modal_alert_automation')}
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Form
          form={createTicketForm}
          layout="vertical"
          name="create_ticket_form"
          initialValues={{
            priority: 'TRUNG BÌNH',
            source: 'Form Web',
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label={<Text strong>{t('help_form_ticket_title')}</Text>}
                rules={[
                  { required: true, message: t('help_form_ticket_title_required') },
                  { min: 10, message: t('help_form_ticket_title_min') }
                ]}
              >
                <Input
                  placeholder={t('help_form_ticket_title_placeholder')}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer"
                label={<Text strong>{t('help_form_customer_name')}</Text>}
                rules={[{ required: true, message: t('help_form_customer_required') }]}
              >
                <Input
                  placeholder={t('help_form_customer_placeholder')}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label={<Text strong>{t('help_form_priority_label')}</Text>}
                rules={[{ required: true, message: t('help_form_priority_required') }]}
              >
                <Input.Group compact>
                  <Form.Item name="priority" noStyle>
                    <Button.Group size="large" style={{ width: '100%', display: 'flex' }}>
                      <Button
                        style={{ flex: 1 }}
                        type={createTicketForm.getFieldValue('priority') === 'THẤP' ? 'primary' : 'default'}
                        onClick={() => createTicketForm.setFieldsValue({ priority: 'THẤP' })}
                      >
                        {t('help_form_priority_low')}
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        type={createTicketForm.getFieldValue('priority') === 'TRUNG BÌNH' ? 'primary' : 'default'}
                        onClick={() => createTicketForm.setFieldsValue({ priority: 'TRUNG BÌNH' })}
                      >
                        {t('help_form_priority_medium')}
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        danger
                        type={createTicketForm.getFieldValue('priority') === 'CAO' ? 'primary' : 'default'}
                        onClick={() => createTicketForm.setFieldsValue({ priority: 'CAO' })}
                        icon={<AlertOutlined />}
                      >
                        {t('help_form_priority_high')}
                      </Button>
                    </Button.Group>
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="source"
                label={<Text strong>{t('help_form_source_label')}</Text>}
                rules={[{ required: true, message: t('help_form_source_required') }]}
              >
                <Input.Group compact>
                  <Form.Item name="source" noStyle>
                    <Button.Group size="large" style={{ width: '100%', display: 'flex' }}>
                      <Button
                        style={{ flex: 1 }}
                        type={createTicketForm.getFieldValue('source') === 'Form Web' ? 'primary' : 'default'}
                        onClick={() => createTicketForm.setFieldsValue({ source: 'Form Web' })}
                      >
                        {t('help_form_source_web')}
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        type={createTicketForm.getFieldValue('source') === 'Email' ? 'primary' : 'default'}
                        onClick={() => createTicketForm.setFieldsValue({ source: 'Email' })}
                      >
                        {t('help_form_source_email')}
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        type={createTicketForm.getFieldValue('source') === 'Điện thoại' ? 'primary' : 'default'}
                        onClick={() => createTicketForm.setFieldsValue({ source: 'Điện thoại' })}
                      >
                        {t('help_form_source_phone')}
                      </Button>
                    </Button.Group>
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assigned"
                label={<Text strong>{t('help_form_assigned_label')}</Text>}
              >
                <Input.Group compact>
                  <Form.Item name="assigned" noStyle>
                    <Button.Group size="large" style={{ width: '100%', display: 'flex' }}>
                      <Button
                        style={{ flex: 1 }}
                        type={!createTicketForm.getFieldValue('assigned') ? 'primary' : 'default'}
                        onClick={() => createTicketForm.setFieldsValue({ assigned: '' })}
                      >
                        {t('help_form_assigned_auto')}
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        type={createTicketForm.getFieldValue('assigned') === 'Trần B' ? 'primary' : 'default'}
                        onClick={() => createTicketForm.setFieldsValue({ assigned: 'Trần B' })}
                      >
                        Trần B
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        type={createTicketForm.getFieldValue('assigned') === 'Nguyễn K' ? 'primary' : 'default'}
                        onClick={() => createTicketForm.setFieldsValue({ assigned: 'Nguyễn K' })}
                      >
                        Nguyễn K
                      </Button>
                    </Button.Group>
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label={<Text strong>{t('help_form_description_label')}</Text>}
          >
            <Input.TextArea
              rows={4}
              placeholder={t('help_form_description_placeholder')}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={<Space><UserOutlined style={{ color: '#1890ff' }} /> {t('Hỗ Trợ - Chi Tiết Phiếu')}</Space>}
        open={isDetailModalVisible}
        onCancel={() => { setIsDetailModalVisible(false); setSelectedTicket(null); detailForm.resetFields(); }}
        onOk={async () => {
          try {
            const values = await detailForm.validateFields();
            const changes = {
              assigned: values.assigned || 'Chưa gán',
              status: values.status || selectedTicket?.status || 'Mới',
            };
            await updateSupportTicket(selectedTicket.key || selectedTicket.id, changes);
            message.success(t('help_msg_ticket_updated'));
            setIsDetailModalVisible(false);
            setSelectedTicket(null);
            detailForm.resetFields();
            fetchTickets();
          } catch (e) {
            console.error('Save ticket detail failed', e);
            message.error(t('help_msg_ticket_update_failed'));
          }
        }}
        width={isMobile ? '94%' : 720}
      >
        {selectedTicket ? (
          <Form form={detailForm} layout="vertical" initialValues={{
            assigned: selectedTicket.assigned === 'Chưa gán' ? '' : selectedTicket.assigned,
            status: selectedTicket.status,
          }}>
            <Form.Item label={t('help_col_id')}>
              <Text strong>{selectedTicket.id}</Text>
            </Form.Item>
            <Form.Item label={t('help_col_title')}>
              <Text>{selectedTicket.title}</Text>
            </Form.Item>
            <Form.Item label={t('help_col_customer')}>
              <Text>{selectedTicket.customer}</Text>
            </Form.Item>
            <Form.Item label="Email liên hệ">
              <Text>{selectedTicket.contactEmail || ''}</Text>
            </Form.Item>
            <Form.Item label={t('help_form_description_label')}>
              <Text>{selectedTicket.description}</Text>
            </Form.Item>
            <Form.Item name="assigned" label={t('help_form_assigned_label')}>
              <Select allowClear placeholder={t('help_form_assigned_auto')}>
                {staffOptions.map(s => <Select.Option key={s.id} value={s.name}>{s.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="status" label={t('help_col_status')}>
              <Select>
                <Select.Option value="Mới">Mới</Select.Option>
                <Select.Option value="Đang Xử lý">Đang Xử lý</Select.Option>
                <Select.Option value="Chờ Phản hồi">Chờ Phản hồi</Select.Option>
                <Select.Option value="Đã Đóng">Đã Đóng</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        ) : null}
      </Modal>
    </>
  );
};

// ===================================================================
// === BẮT ĐẦU PHẦN CODE BLOG ĐÃ NÂNG CẤP (Grid/Table + Pin) ===
// ===================================================================

const BlogManagementTab = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form] = Form.useForm();

  // --- State cho bộ lọc ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- State cho Modal bình luận ---
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [currentPostComments, setCurrentPostComments] = useState(null);

  // --- (MỚI) State cho Chế độ xem ---
  const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'table'

  const fetchPosts = useCallback(() => {
    setLoading(true);
    try {
      // Chuẩn hóa dữ liệu ngay khi tải, thêm 'isPinned'
      const posts = getStoredBlogPosts().map(p => ({
        ...p,
        status: p.status || 'published',
        views: p.views || 0,
        likes: p.likes || 0,
        commentsData: p.commentsData || [],
        comments: p.commentsData ? p.commentsData.length : (p.comments || 0),
        isPinned: p.isPinned || false, // (MỚI) Đảm bảo có 'isPinned'
      }));
      setBlogPosts(posts);
    } catch (e) {
      message.error("Không thể tải danh sách bài viết.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();

    const onBlogUpdated = () => {
      console.log("Admin: Nhận được cập nhật, đang tải lại bài viết...");
      fetchPosts();
    };
    window.addEventListener('blog_posts_updated', onBlogUpdated);
    const onStorage = (ev) => {
      if ((ev.key === BLOG_STORAGE_KEY) || (ev.detail && ev.detail.key === BLOG_STORAGE_KEY)) {
        onBlogUpdated();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('blog_posts_updated', onBlogUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchPosts]);

  const handleOpenModal = (post = null) => {
    setEditingPost(post);
    if (post) {
      form.setFieldsValue({
        ...post,
        tags: (post.tags || []).join(', '),
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPost(null);
    form.resetFields();
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      let updatedPosts = [...blogPosts];
      const formValues = {
        ...values,
        tags: (values.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (editingPost) {
        updatedPosts = updatedPosts.map(p =>
          p.id === editingPost.id ? { ...editingPost, ...formValues } : p
        );
        message.success("Bài viết đã được cập nhật!");
      } else {
        const newPost = {
          ...formValues,
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          author: MOCK_CURRENT_USER,
          avatar: 'https://i.pravatar.cc/150?img=1',
          views: 0,
          likes: 0,
          comments: 0,
          commentsData: [],
          readTime: '5 phút đọc',
          status: 'published',
          isPinned: false, // (MỚI) Mặc định khi tạo mới
        };
        updatedPosts = [newPost, ...updatedPosts];
        message.success("Bài viết mới đã được tạo!");
      }

      setBlogPosts(updatedPosts);
      saveStoredBlogPosts(updatedPosts);
      handleCancel();
    }).catch(err => {
      console.error('Validation failed:', err);
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa bài viết?',
      content: 'Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        const updatedPosts = blogPosts.filter(p => p.id !== id);
        setBlogPosts(updatedPosts);
        saveStoredBlogPosts(updatedPosts);
        message.success('Bài viết đã được xóa!');
      },
    });
  };

  const handleTogglePublish = (postId, checked) => {
    const newStatus = checked ? 'published' : 'draft';
    setBlogPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post =>
        post.id === postId ? { ...post, status: newStatus } : post
      );
      saveStoredBlogPosts(updatedPosts);
      return updatedPosts;
    });
    message.success(`Đã cập nhật trạng thái: ${newStatus === 'published' ? 'Xuất bản' : 'Bản nháp'}`);
  };
  
  // --- (MỚI) Hàm để Ghim / Bỏ ghim ---
  const handleTogglePin = (postId) => {
    const updatedPosts = blogPosts.map(post =>
      post.id === postId ? { ...post, isPinned: !post.isPinned } : post
    );
    setBlogPosts(updatedPosts);
    saveStoredBlogPosts(updatedPosts);
    const post = updatedPosts.find(p => p.id === postId);
    message.success(post.isPinned ? 'Đã ghim bài viết!' : 'Đã bỏ ghim bài viết.');
  };

  // --- Hàm mở/đóng Modal bình luận ---
  const showCommentModal = (post) => {
    setCurrentPostComments(post);
    setIsCommentModalVisible(true);
  };

  const handleCommentModalCancel = () => {
    setIsCommentModalVisible(false);
    setCurrentPostComments(null);
  };
  
  // --- (MỚI) Logic lọc VÀ SẮP XẾP ---
  const categories = Array.from(new Set(blogPosts.map(p => p.category)))
    .filter(Boolean)
    .map(c => ({ value: c, label: c }));

  const processedPosts = React.useMemo(() => {
    // 1. Lọc (Filter)
    const filtered = blogPosts.filter(post => {
      const titleMatch = (post.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = !selectedCategory || post.category === selectedCategory;
      return titleMatch && categoryMatch;
    });

    // 2. Sắp xếp (Sort): Bài ghim lên đầu, sau đó mới tới bài mới nhất
    const sorted = filtered.sort((a, b) => {
      // Logic ghim:
      if (a.isPinned && !b.isPinned) return -1; // a (ghim) lên trước
      if (!a.isPinned && b.isPinned) return 1;  // b (ghim) lên trước
      
      // Nếu cả 2 đều ghim hoặc đều không ghim, thì sort theo ID (mới nhất trước)
      return b.id - a.id; 
    });

    return sorted;
  }, [blogPosts, searchTerm, selectedCategory]);

  // --- (MỚI) Cột cho Chế độ xem Bảng (Table View) ---
  const tableColumns = [
    {
      title: 'Bài viết',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Space>
          {record.isPinned && (
            <Tooltip title="Đã ghim">
              <PushpinOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
          <Avatar src={record.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${record.author}`} />
          <Text style={{ maxWidth: 300 }} ellipsis={{ tooltip: title }}>{title}</Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tooltip title={status === 'published' ? 'Tắt xuất bản (chuyển về Nháp)' : 'Xuất bản bài viết'}>
          <Switch
            checked={status === 'published'}
            onChange={(checked) => handleTogglePublish(record.id, checked)}
          />
        </Tooltip>
      )
    },
    {
      title: 'Thống kê',
      key: 'stats',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text type="secondary"><EyeOutlined /> {record.views || 0}</Text>
          <Text type="secondary"><LikeOutlined /> {record.likes || 0}</Text>
        </Space>
      ),
      sorter: (a, b) => (a.views + a.likes) - (b.views + b.likes),
    },
    {
      title: 'Bình luận',
      dataIndex: 'comments',
      key: 'comments',
      width: 120,
      render: (comments, record) => (
         <Button 
            type="link" 
            icon={<MessageOutlined />} 
            onClick={() => showCommentModal(record)}
          >
            {comments || 0}
          </Button>
      ),
      sorter: (a, b) => a.comments - b.comments,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title={record.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}>
            <Button
              icon={<PushpinOutlined />}
              style={{ color: record.isPinned ? '#1890ff' : 'inherit' }}
              onClick={() => handleTogglePin(record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <>
      {/* --- PHẦN BỘ LỌC VÀ TÌM KIẾM (ĐÃ NÂNG CẤP) --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm theo tiêu đề..."
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo danh mục"
            style={{ width: 180 }}
            allowClear
            options={categories}
            onChange={(value) => setSelectedCategory(value)}
            value={selectedCategory}
          />
          {/* (MỚI) Nút chuyển đổi Grid/Table */}
          <Button.Group>
            <Tooltip title="Xem dạng Lưới">
              <Button
                icon={<AppstoreOutlined />}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              />
            </Tooltip>
            <Tooltip title="Xem dạng Bảng">
              <Button
                icon={<BarsOutlined />}
                type={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
              />
            </Tooltip>
          </Button.Group>
        </Space>
        
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)} style={GRADIENT_BUTTON_STYLE}>
          Tạo bài viết mới
        </Button>
      </div>

      {/* --- (MỚI) PHẦN HIỂN THỊ CÓ ĐIỀU KIỆN --- */}
      {viewMode === 'grid' ? (
        // --- CHẾ ĐỘ XEM LƯỚI (GRID VIEW) ---
        <List
          loading={loading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={processedPosts} // Sử dụng dữ liệu đã lọc và SẮP XẾP
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            pageSize: 8,
            align: 'center',
          }}
          renderItem={(post) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <img
                    alt={post.title}
                    src={post.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
                actions={[
                  // (MỚI) Action 1: Ghim bài viết
                  <Tooltip title={post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}>
                    <PushpinOutlined
                      style={{ color: post.isPinned ? '#1890ff' : 'inherit' }}
                      onClick={(e) => { e.stopPropagation(); handleTogglePin(post.id); }}
                    />
                  </Tooltip>,
                  // Action 2: Bật/Tắt Publish
                  <Tooltip title={post.status === 'published' ? 'Tắt xuất bản (chuyển về Nháp)' : 'Xuất bản bài viết'}>
                    <Switch
                      size="small"
                      checked={post.status === 'published'}
                      onChange={(checked, e) => {
                        e.stopPropagation();
                        handleTogglePublish(post.id, checked);
                      }}
                    
                    />
                  </Tooltip>,
                  // Action 3: Chỉnh sửa
                  <Tooltip title="Chỉnh sửa">
                    <EditOutlined key="edit" onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(post);
                    }} />
                  </Tooltip>,
                  // Action 4: Xóa
                  <Tooltip title="Xóa">
                    <DeleteOutlined key="delete" onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }} />
                  </Tooltip>,
                ]}
              >
                {/* Tag trạng thái (Bản nháp) */}
                {post.status === 'draft' && (
                  <Tag
                    color="gold"
                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                  >
                    Bản Nháp
                  </Tag>
                )}
                
                <Card.Meta
                  avatar={<Avatar src={post.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${post.author}`} />}
                  title={<Text ellipsis={{ tooltip: post.title }}>{post.title}</Text>}
                  description={<Text type="secondary" ellipsis={{ rows: 2 }}>{post.description}</Text>}
                />

                <div style={{ marginTop: 16, minHeight: '60px' }}>
                  <Tag color="blue" style={{ marginBottom: 8 }}>{post.category}</Tag>
                  <Space size={[0, 8]} wrap>
                    {(post.tags || []).map(tag => <Tag key={tag}>{tag}</Tag>)}
                  </Space>
                </div>

                <Space style={{ color: '#8c8c8c', marginTop: 16, paddingTop: 16, width: '100%', justifyContent: 'space-around', borderTop: '1px solid #f0f0f0' }}>
                  <Tooltip title="Lượt xem">
                    <Space>
                      <EyeOutlined />
                      <Text type="secondary">{post.views || 0}</Text>
                    </Space>
                  </Tooltip>
                  <Tooltip title="Lượt thích">
                    <Space>
                      <LikeOutlined />
                      <Text type="secondary">{post.likes || 0}</Text>
                    </Space>
                  </Tooltip>
                  <Tooltip title="Xem bình luận">
                    <Space 
                      onClick={(e) => { e.stopPropagation(); showCommentModal(post); }} 
                      style={{ cursor: 'pointer' }}
                    >
                      <MessageOutlined />
                      <Text type="secondary">{post.commentsData?.length || post.comments || 0}</Text>
                    </Space>
                  </Tooltip>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        // --- (MỚI) CHẾ ĐỘ XEM BẢNG (TABLE VIEW) ---
        <Table
          loading={loading}
          columns={tableColumns}
          dataSource={processedPosts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            align: 'center',
          }}
          scroll={{ x: 'max-content' }}
        />
      )}

      {/* Modal Chỉnh sửa / Tạo mới (Giữ nguyên) */}
      <Modal
        title={editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          name="blog_post_form"
          initialValues={{ status: 'published' }}
        >
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả ngắn" rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="image" label="Link Ảnh bìa" rules={[{ required: true, message: 'Vui lòng nhập link ảnh' }, { type: 'url', message: 'Link ảnh không hợp lệ' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng nhập danh mục' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="Tags (phân cách bằng dấu phẩy)">
                <Input placeholder="Voucher, Giảm Giá, 11.11, ..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="Nội dung chi tiết">
            <Input.TextArea rows={10} placeholder="Nội dung chi tiết bài viết... (Bạn có thể dùng text hoặc HTML cơ bản)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem bình luận (Giữ nguyên) */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            Bình luận cho bài viết: "{currentPostComments?.title}"
          </Space>
        }
        open={isCommentModalVisible}
        onCancel={handleCommentModalCancel}
        footer={[
          <Button key="close" onClick={handleCommentModalCancel}>
            Đóng
          </Button>,
        ]}
      >
        <List
          dataSource={currentPostComments?.commentsData || []}
          locale={{ emptyText: "Chưa có bình luận nào cho bài viết này." }}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={comment.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${comment.author}`} />}
                title={<Text strong>{comment.author}</Text>}
                description={comment.content}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{comment.date}</Text>
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

// ===================================================================
// === KẾT THÚC PHẦN CODE BLOG ĐÃ CẬP NHẬT ===
// ===================================================================


const ReportsAnalyticsTab = ({ allTickets }) => {
  const { t } = useTranslation();

  const processTicketDataForChart = (tickets, t) => {
    const now = Date.now();
    const daysAgo = (n) => now - n * 24 * 60 * 60 * 1000;

    const labels = [
      '0-7 Ngày', '8-14 Ngày', '15-21 Ngày', '22-28 Ngày', '29-35 Ngày', '> 35 Ngày'
    ];
    const openData = new Array(6).fill(0);
    const closedData = new Array(6).fill(0);

    (tickets || []).forEach(ticket => {
      const createdAt = ticket.updated;

      let bucket = -1;
      if (createdAt > daysAgo(7)) bucket = 0;
      else if (createdAt > daysAgo(14)) bucket = 1;
      else if (createdAt > daysAgo(21)) bucket = 2;
      else if (createdAt > daysAgo(28)) bucket = 3;
      else if (createdAt > daysAgo(35)) bucket = 4;
      else bucket = 5;

      if (bucket > -1) {
        openData[bucket]++;
        if (ticket.status === 'Đã Đóng') {
          closedData[bucket]++;
        }
      }
    });

    return {
      labels,
      datasets: [
        { label: t('help_report_chart_open', 'Ticket Mới'), data: openData.reverse(), borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', tension: 0.4 },
        { label: t('help_report_chart_closed', 'Ticket Đã Đóng'), data: closedData.reverse(), borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', tension: 0.4 },
      ],
    };
  };

  const calculateAgentPerformance = (tickets) => {
    const perf = {};

    (tickets || []).forEach((ticket) => {
      const agent = ticket.assigned;
      if (agent === 'Chưa gán') return;

      if (!perf[agent]) {
        perf[agent] = {
          key: agent,
          agent: agent,
          assigned: 0,
          closed: 0,
        };
      }

      perf[agent].assigned++;
      if (ticket.status === 'Đã Đóng') {
        perf[agent].closed++;
      }
    });

    return Object.values(perf);
  };

  const chartData = processTicketDataForChart(allTickets, t);
  const performanceData = calculateAgentPerformance(allTickets);

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: t('help_report_chart_y_axis', 'Số lượng Ticket') } },
      x: { title: { display: true, text: t('help_report_chart_x_axis', 'Thời gian (tính ngược từ hôm nay)') } }
    }
  };

  const performanceColumns = [
    { title: t('help_col_assigned'), dataIndex: 'agent', key: 'agent' },
    { title: t('help_report_total_assigned', 'Tổng Ticket Gán'), dataIndex: 'assigned', key: 'assigned', sorter: (a, b) => a.assigned - b.assigned },
    { title: t('help_report_col_closed'), dataIndex: 'closed', key: 'closed', sorter: (a, b) => a.closed - b.closed },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Title level={4}>{t('help_report_title_trend')}</Title>
      <Card>
        <Line options={chartOptions} data={chartData} key={allTickets.length} />
      </Card>
      <Title level={4}>{t('help_report_title_performance')}</Title>
      <Table columns={performanceColumns} dataSource={performanceData} pagination={false} />
    </Space>
  );
};

const AutomationSettingsTab = () => {
  const { t } = useTranslation();
  const [automationRules, setAutomationRules] = useState(mockAutomationRules);
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const handleCreateRule = () => {
    createForm.validateFields().then(values => {
      const newRule = {
        key: automationRules.length + 1,
        name: values.ruleName,
        condition: values.condition,
        action: values.action,
        enabled: true
      };
      setAutomationRules([...automationRules, newRule]);
      message.success(t('help_automation_msg_created') || 'Quy tắc tự động được tạo thành công!');
      setIsCreateModalVisible(false);
      createForm.resetFields();
    }).catch(err => {
      console.error('Validation failed:', err);
    });
  };
  const handleEditRule = (rule) => {
    setEditingRule(rule);
    editForm.setFieldsValue({
      ruleName: rule.name,
      condition: rule.condition,
      action: rule.action,
      enabled: rule.enabled
    });
    setIsEditModalVisible(true);
  };
  const handleSaveEdit = () => {
    editForm.validateFields().then(values => {
      const updatedRules = automationRules.map(rule =>
        rule.key === editingRule.key
          ? {
            ...rule,
            name: values.ruleName,
            condition: values.condition,
            action: values.action,
            enabled: values.enabled
          }
          : rule
      );
      setAutomationRules(updatedRules);
      message.success(t('help_automation_msg_updated') || 'Quy tắc tự động được cập nhật thành công!');
      setIsEditModalVisible(false);
      setEditingRule(null);
      editForm.resetFields();
    }).catch(err => {
      console.error('Validation failed:', err);
    });
  };
  const handleDeleteRule = (key) => {
    Modal.confirm({
      title: 'Xóa Quy tắc?',
      content: 'Bạn có chắc chắn muốn xóa quy tắc tự động này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setAutomationRules(automationRules.filter(rule => rule.key !== key));
        message.success('Quy tắc tự động đã được xóa!');
      },
    });
  };
  const handleToggleStatus = (key) => {
    const updatedRules = automationRules.map(rule =>
      rule.key === key ? { ...rule, enabled: !rule.enabled } : rule
    );
    setAutomationRules(updatedRules);
    message.success('Trạng thái quy tắc đã được cập nhật!');
  };
  const rulesColumns = [
    {
      title: t('help_automation_col_name'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: t('help_automation_col_condition'),
      dataIndex: 'condition',
      key: 'condition',
      ellipsis: true,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: t('help_automation_col_action'),
      dataIndex: 'action',
      key: 'action',
      ellipsis: true,
      render: (text) => <Tag color="green">{text}</Tag>
    },
    {
      title: t('help_automation_col_status'),
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled, record) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggleStatus(record.key)}
        />
      )
    },
    {
      title: t('help_col_actions'),
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEditRule(record)}
            title="Chỉnh sửa quy tắc"
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDeleteRule(record.key)}
            title="Xóa quy tắc"
          />
        </Space>
      )
    },
  ];
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message={t('help_automation_rules_title')}
        description="Tự động gán Ticket, đặt Ưu tiên, hoặc gửi phản hồi mẫu dựa trên điều kiện. Việc này giúp tiết kiệm thời gian đáng kể."
        type="warning"
        showIcon
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            createForm.resetFields();
            setIsCreateModalVisible(true);
          }}
          style={GRADIENT_BUTTON_STYLE}
        >
          {t('help_automation_btn_create_new')}
        </Button>
      </div>
      {isMobile ? (
        <List
          dataSource={automationRules}
          renderItem={(rule) => (
            <List.Item>
              <Card className="automation-rule-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rule.name}</div>
                    <Space size="small" wrap>
                      <Tag color="blue" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{rule.condition}</Tag>
                      <Tag color="green" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{rule.action}</Tag>
                    </Space>
                  </div>
                  <div style={{ marginLeft: 12 }}>
                    <Space>
                      <Switch checked={rule.enabled} onChange={() => handleToggleStatus(rule.key)} />
                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditRule(rule)} />
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteRule(rule.key)} />
                    </Space>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Table
          columns={rulesColumns}
          dataSource={automationRules}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      )}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#667eea' }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>Tạo Quy tắc Tự động Mới</span>
          </Space>
        }
        open={isCreateModalVisible}
        onOk={handleCreateRule}
        onCancel={() => {
          setIsCreateModalVisible(false);
          createForm.resetFields();
        }}
        width={700}
        okText="Tạo"
        cancelText="Hủy"
        okButtonProps={{ icon: <PlusOutlined /> }}
      >
        <Alert
          message="Thiết lập một quy tắc mới"
          description="Xác định điều kiện kích hoạt và hành động tương ứng để tự động hóa công việc xử lý Ticket."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />
        <Form
          form={createForm}
          layout="vertical"
          name="create_rule_form"
        >
          <Form.Item
            name="ruleName"
            label={<Text strong>Tên Quy tắc</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập tên quy tắc' },
              { min: 5, message: 'Tên quy tắc phải có ít nhất 5 ký tự' }
            ]}
          >
            <Input
              placeholder="VD: Tự động gán Ticket từ Email"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="condition"
            label={<Text strong>Điều kiện (Kích hoạt khi)</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn điều kiện' }]}
          >
            <Select
              placeholder="Chọn điều kiện kích hoạt"
              size="large"
              options={[
                { label: 'Tiêu đề chứa từ khóa', value: 'Tiêu đề chứa từ khóa' },
                { label: 'Nguồn là Email', value: 'Nguồn là Email' },
                { label: 'Nguồn là Form Web', value: 'Nguồn là Form Web' },
                { label: 'Độ ưu tiên là CAO', value: 'Độ ưu tiên là CAO' },
                { label: 'Khách hàng mới', value: 'Khách hàng mới' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="action"
            label={<Text strong>Hành động (Thực hiện)</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
          >
            <Select
              placeholder="Chọn hành động tự động"
              size="large"
              options={[
                { label: 'Gán cho Trần B', value: 'Gán cho Trần B' },
                { label: 'Gán cho Nguyễn K', value: 'Gán cho Nguyễn K' },
                { label: 'Đặt Ưu tiên CAO', value: 'Đặt Ưu tiên CAO' },
                { label: 'Đặt Ưu tiên TRUNG BÌNH', value: 'Đặt Ưu tiên TRUNG BÌNH' },
                { label: 'Đặt Ưu tiên THẤP', value: 'Đặt Ưu tiên THẤP' },
                { label: 'Gửi phản hồi tự động', value: 'Gửi phản hồi tự động' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="enabled"
            label={<Text strong>Trạng thái</Text>}
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#faad14' }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>Chỉnh sửa Quy tắc Tự động</span>
          </Space>
        }
        open={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingRule(null);
          editForm.resetFields();
        }}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{ icon: <SaveOutlined /> }}
      >
        <Alert
          message="Cập nhật quy tắc tự động"
          description="Chỉnh sửa các thông tin của quy tắc để phù hợp với nhu cầu của bạn."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />
        <Form
          form={editForm}
          layout="vertical"
          name="edit_rule_form"
        >
          <Form.Item
            name="ruleName"
            label={<Text strong>Tên Quy tắc</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập tên quy tắc' },
              { min: 5, message: 'Tên quy tắc phải có ít nhất 5 ký tự' }
            ]}
          >
            <Input
              placeholder="VD: Tự động gán Ticket từ Email"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="condition"
            label={<Text strong>Điều kiện (Kích hoạt khi)</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn điều kiện' }]}
          >
            <Select
              placeholder="Chọn điều kiện kích hoạt"
              size="large"
              options={[
                { label: 'Tiêu đề chứa từ khóa', value: 'Tiêu đề chứa từ khóa' },
                { label: 'Nguồn là Email', value: 'Nguồn là Email' },
                { label: 'Nguồn là Form Web', value: 'Nguồn là Form Web' },
                { label: 'Độ ưu tiên là CAO', value: 'Độ ưu tiên là CAO' },
                { label: 'Khách hàng mới', value: 'Khách hàng mới' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="action"
            label={<Text strong>Hành động (Thực hiện)</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
          >
            <Select
              placeholder="Chọn hành động tự động"
              size="large"
              options={[
                { label: 'Gán cho Trần B', value: 'Gán cho Trần B' },
                { label: 'Gán cho Nguyễn K', value: 'Gán cho Nguyễn K' },
                { label: 'Đặt Ưu tiên CAO', value: 'Đặt Ưu tiên CAO' },
                { label: 'Đặt Ưu tiên TRUNG BÌNH', value: 'Đặt Ưu tiên TRUNG BÌNH' },
                { label: 'Đặt Ưu tiên THẤP', value: 'Đặt Ưu tiên THẤP' },
                { label: 'Gửi phản hồi tự động', value: 'Gửi phản hồi tự động' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="enabled"
            label={<Text strong>Trạng thái</Text>}
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

const SupportPage = () => {
  const { t } = useTranslation();
  const width = useWindowWidth();
  const isMobile = width < 768;

  const [allTicketsData, setAllTicketsData] = useState([]);

  const handleTicketsLoaded = useCallback((tickets) => {
    setAllTicketsData(tickets);
  }, []);

  const items = [
    {
      key: '1',
      label: <Space><SolutionOutlined style={{ backgroundColor: '#1890ff', color: 'white', padding: '5px', borderRadius: '8px' }} />{t('help_tab_ticket_management')}</Space>,
      children: <TicketManagementTab onTicketsLoaded={handleTicketsLoaded} />,
    },
    {
      key: '2',
      label: <Space><BookOutlined style={{ backgroundColor: '#52c41a', color: 'white', padding: '5px', borderRadius: '8px' }} /> Quản lý Blog</Space>,
      children: <BlogManagementTab />,
    },
    {
      key: '3',
      label: <Space><LineChartOutlined style={{ backgroundColor: '#faad14', color: 'white', padding: '5px', borderRadius: '8px' }} />{t('help_tab_reports_analytics')}</Space>,
      children: <ReportsAnalyticsTab allTickets={allTicketsData} />,
    },
    {
      key: '4',
      label: <Space><SettingOutlined style={{ backgroundColor: '#722ed1', color: 'white', padding: '5px', borderRadius: '8px' }} /> {t('help_tab_automation_settings')}</Space>,
      children: <AutomationSettingsTab />,
    },
  ];
  return (
    <Layout style={{ padding: '0 24px 24px' }}>
      <Title level={isMobile ? 4 : 2} style={{ margin: '16px 0' }}>
        {isMobile ? t('help_title') : `🔥 ${t('help_title')}`}
      </Title>
      <Content
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
          background: '#fff',
          borderRadius: 8,
          paddingBottom: isMobile ? 120 : 24, // avoid overlap with floating actions on mobile
          paddingRight: isMobile ? 22 : 24,
        }}
      >
        <Tabs
          defaultActiveKey="1"
          items={items}
          size={isMobile ? 'small' : 'large'}
        />
      </Content>
    </Layout>
  );
};
export default SupportPage;