import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Drawer, Tag, Space, Select } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import { article, addArticle, updateArticle, removeArticle } from '@/services/article';
import { tag } from '@/services/tag';
import { category } from '@/services/category';

const handleUpdate = async (fields) => {
  const hide = message.loading('修改中');
  try {
    await updateArticle(fields);
    hide();
    message.success('修改成功');
    return true;
  } catch (error) {
    hide();
    message.error('修改失败，请重试');
    return false;
  }
};

const handleRemove = async (selectedRows) => {
  const hide = message.loading('删除中');
  if (!selectedRows) return true;

  try {
    await removeArticle(selectedRows);
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const ArticleList = () => {
  const [tagList, setTagList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState();
  const actionRef = useRef();

  useEffect(() => {
    tag().then(res => {
      setTagList(res?.data?.map(item => ({ label: item?.name, value: item?.id + '' })))
    })
    category().then(res => {
      setCategoryList(res?.data?.map(item => ({ label: item?.name, value: item?.id })))
    })
  }, [])

  const columns = [
    {
      title: "ID",
      dataIndex: 'id',
      hideInSearch: true,
      editable: false,
      width: 48,
      render: (val, record) => {
        return (
          <a
            type="link"
            onClick={() => {
              window.open(record.href)
            }}
          >
            {val}
          </a>
        );
      },
    },
    {
      title: "标题",
      dataIndex: 'title',
      ellipsis: true,
      copyable: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      valueType: 'select',
      fieldProps: {
        options: categoryList
      }
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (val) => {
        return (
          <Space>
            {
              Array.isArray(val) && val.map(i => <Tag color="cyan" key={i} value={i}>{tagList.find(v => v.value == i)?.label}</Tag>)
            }
          </Space>
        )
      },
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        return (
          <Select mode="tags" options={tagList} />
        );
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInTable: true,
      hideInDescriptions: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: "内容",
      dataIndex: 'content',
      hideInTable: true,
      valueType: 'code'
    },
    {
      title: '操作',
      hideInForm: true,
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="detail"
          type="link"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          查看
        </a>,
        <a
          key="edit"
          type="link"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          快速编辑
        </a>,
        <a
          key="edit"
          type="link"
          onClick={() => {
            window.location.href = '/article-detail/' + record.id
          }}
        >
          编辑
        </a>
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        rowKey="id"
        headerTitle="文章列表"
        request={article}
        columns={columns}
        actionRef={actionRef}
        editable={{
          onSave: async (_, data) => {
            await handleUpdate(data)
          },
          onDelete: async (_, data) => {
            await handleRemove(data)
          },
        }}
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              window.location.href = '/article-detail'
            }}
          >
            <PlusOutlined />
            新文章
          </Button>,
        ]}
        columnsState={{
          defaultValue: {
            updatedAt: { show: false }
          },
        }}
      // form={{
      //   // 由于配置了 transform，提交的参数与定义的不同这里需要转化一下
      //   syncToUrl: (values, type) => {
      //     if (type === 'get') {
      //       return {
      //         ...values,
      //         created_at: [values.startTime, values.endTime],
      //       };
      //     }
      //     return values;
      //   },
      // }}
      />

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.title && (
          <ProDescriptions
            column={1}
            title={currentRow?.title}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ArticleList;
