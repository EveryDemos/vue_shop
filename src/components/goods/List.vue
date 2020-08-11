<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="9">
          <!--搜索与添加区域-->
          <el-input placeholder="请输入内容" clearable @clear="geGoodsList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="geGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!--商品列表区-->
    <el-table :data="goodsList" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column label="商品价格(元)" prop="goods_price"></el-table-column>
      <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
      <el-table-column label="创建时间" prop="add_time">
        <template slot-scope="scope">{{scope.row.add_time|dateFormat}}</template>
      </el-table-column>

      <el-table-column label="操作" width="190px">
        <template slot-scope="scope">
          <el-row>
            <!--编辑商品-->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.goods_id)"
            ></el-button>
            <!--删除商品-->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodById(scope.row.goods_id)"
            ></el-button>
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      //搜索内容
      queryInfo: {
        query: '',
        //当前页数
        pagenum: 1,
        //每页显示条数
        pagesize: 5
      },
      //商品列表
      goodsList: [],
      //总条数
      total: 0

    }
  },
  created() {
    this.geGoodsList()
  },
  methods: {
    //获取商品列表
    async geGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error("查询商品列表失败")
      }
      console.log(res)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    //编辑商品
    showEditDialog(id) {

    },
    //删除商品
    async removeGoodById(id) {
      const confirm = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirm !== 'confirm') {

        return this.$message.info("已经取消删除商品")
      }

      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除商品失败")
      }
      this.$message.success("删除商品成功")
      this.geGoodsList()
    },
    //监听当前页数事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.geGoodsList()
    },
    //监听每页显示的条数
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.geGoodsList()
    },
    //添加商品跳转页面
    goAddPage(){
        this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
</style>