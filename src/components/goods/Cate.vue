<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--添加分类按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog()">添加分类</el-button>
        </el-col>
      </el-row>
      <!--数据展示区-->

      <zk-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
      >
        <template slot="isOk" slot-scope="scop">
          <i class="el-icon-success" v-if="scop.row.cat_deleted===false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <template slot="order" slot-scope="scop">
          <el-tag v-if="scop.row.cat_level===0">一级</el-tag>
          <el-tag type="success" v-else-if="scop.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!--操作-->
        <template slot="opt" slot-scope="scop">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </zk-table>
      <!--分页区-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog title="添加分类" :visible.sync="OptDialogVisible" width="50%"
    @close="addCateDialogClosed">
      <el-form ref="cateFormRef" :rules="cateRules" :model="addCateForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props="cateProps"
            @change="handleChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="OptDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //获取商品分类管理列表对象
      queryinfo: {
        type: 3,
        //当前页数
        pagenum: 1,
        //每页显示多少条数据
        pagesize: 5
      },
      //列表数据
      cateList: [],
      //总条数
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '400px',
        },
        {
          label: '是否有效',
          //表示将当前列定义为模板列
          type: 'template',
          //当前这一列使用的模板名称
          template: 'isOk',
        },
        {
          label: '排序',
          //表示将当前列定义为模板列
          type: 'template',
          //当前这一列使用的模板名称
          template: 'order',
        },
        {
          label: '操作',
          //表示将当前列定义为模板列
          type: 'template',
          //当前这一列使用的模板名称
          template: 'opt',
        }],
      //控制添加分类对框框的显示与隐藏
      OptDialogVisible: false,
      //添加分类表单的数据对象
      addCateForm: {
        //将要添加的分类名称
        cat_name: "",
        //父级分类的id
        cat_pid: 0,
        //分类的等级，默认添加的是一级分类
        cat_level: 0
      },
      cateRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }]
      },
      //父级分类的列表
      parentCateList: [],
      //指定级联选择器的配置对象
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      selectKeys: []

    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类列表管理数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryinfo })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    //监听pagesize改变的事件
    handleSizeChange(newsize) {
      this.queryinfo.pagesize = newsize
      this.getCateList()
    },
    //监听页码值改变的事件
    handleCurrentChange(newpage) {
      this.queryinfo.pagenum = newpage
      this.getCateList()
    },
    //添加分类
    showAddDialog() {
      //展示对话框之前显示父级列表
      this.getParentCateList()
      this.OptDialogVisible = true
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      //console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      this.parentCateList = res.data

    },
    //选择分类列表
    handleChange() {
      //console.log(this.selectKeys)
      //如果selectKeys的length>0,则选中了父级分类
      //反之，则说明没有选中任何父级分类
      if (this.selectKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        //为当前分类的等级赋值
        this.addCateForm.cat_level=this.selectKeys.length
        return
      }else{
          this.addCateForm.cat_pid = 0
        //为当前分类的等级赋值
        this.addCateForm.cat_level=0
      }
    },
    //点击按钮，添加新的分类
   async addCate(){
        //console.log(this.addCateForm)
       const {data:res}= await this.$http.post('categories',this.addCateForm )
       if(res.meta.status!=201){
         return  this.$message.error("添加分类失败")
       }
        this.$message.success("添加分类成功")
        this.getCateList()
        this.OptDialogVisible=false
    },
    //监听添加分类对话框的关闭事件
    addCateDialogClosed(){
        this.$refs.cateFormRef.resetFields()
        this.selectKeys=[]
        this.addCateForm.cat_pid=0
        this.addCateForm.cat_level=0
    }
  }
}
</script>

<style lang="less" scoped>
</style>