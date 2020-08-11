<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="9">
          <!--搜索与添加区域-->
          <el-input placeholder="请输入内容" clearable @clear="getOrderList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--订单列表区-->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_id"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
          <template slot-scope="scope">
            <template>{{scope.row.is_send}}</template>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="update_time">
          <template slot-scope="scope">{{scope.row.update_time|dateFormat}}</template>
        </el-table-column>

        <el-table-column label="操作" width="190px">
          <template slot-scope="scope">
            <el-row>
              <!--编辑订单 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
              <!--展示物流进度-->
              <el-button type="info" icon="el-icon-message" size="mini" @click="showPrograssBox"></el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!--修改地址对话框-->
    <el-dialog title="修改地址对话框" :visible.sync="editDialogVisible" width="50%">
      <span>
        <el-form
          :model="editAddressForm"
          :rules="editAddressFormRules"
          ref="editAddressFormRef"
          label-width="100px"
        >
          <el-form-item label="省/市区" prop="address1">
            <el-input v-model="editAddressForm.address1"></el-input>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="editAddressForm.address2"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!--展示物流进度对话框-->
    <el-dialog title="物流进度" :visible.sync="dialogPrograssVisible" width="50%">
      <span>
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(activity, index) in prograssList"
            :key="index"
            :timestamp="activity.ftime"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogPrograssVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogPrograssVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,//当前页
        //当前每页显示多少条数据
        pagesize: 10
      },
      orderList: [],
      //总条数
      total: 0,
      //控制对话框的隐藏和展示
      editDialogVisible: false,
      //控制物流进度的显示与隐藏
      dialogPrograssVisible: false,
      editAddressForm: {
        address1: [],
        address2: ''
      },
      editAddressFormRules: {
        address1: [
          { required: true, message: '请输入省/市', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      //物流信息列表
      prograssList: []
    }
  },
  created() {
    this.getOrderList()
  },

  methods: {
    //获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
      console.log(res)

    },
    //编辑订单
    showBox() {
      this.editDialogVisible = true
    },
    //展示物流进度对话框
    async showPrograssBox() {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) {
        return this.$message.error("查询物流信息失败")
      }

      console.log(res.data)
      this.prograssList = res.data
      this.dialogPrograssVisible = true
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
    }
  }

}
</script>

<style lang="less" scoped>
</style>