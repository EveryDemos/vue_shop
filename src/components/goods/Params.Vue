<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--头部警告区域-->
      <el-alert title="注意:只允许选择至三级" type="warning" show-icon></el-alert>
      <!--选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!--选择商品分类的级联选择框-->
          <el-cascader
            v-model="selectKeys"
            :options="cateList"
            :props="cateListProps"
            @change="selectCateChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!--几连选择标签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--添加动态参数面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >动态参数</el-button>
          <!--动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <!--展开列-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--循环渲染tag标签-->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <!--输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>

            <!--索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-row>
                  <!--编辑-->
                  <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                  <!--删除-->
                  <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--添加静态属性面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >静态属性</el-button>
          <!--静态参数表格-->
          <el-table :data="onlyTableData" border stripe>
            <!--展开列-->
            <el-table-column type="expand"></el-table-column>

            <!--索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-row>
                  <!--编辑-->
                  <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                  <!--删除-->
                  <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加静态和动态属性对话框-->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogVisibleClosed"
    >
      <el-form :model="AddForm" :rules="AddFormRules" ref="AddFormRef" label-width="100px">
        <el-form-item :label="titleText+':'" prop="attr_name">
          <el-input v-model="AddForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return{
            cateList:[],
            //级联选择框双向绑定的数组
            selectKeys:[],
            //级联选择器框的配置对象
            cateListProps:{
                expandTrigger:"hover",
                value:"cat_id",
                label:"cat_name",
                children:"children"
            },
           activeName:'many',
           //动态表格数据
           manyTableData:[],
           //静态表格数据
           onlyTableData:[],
           //控制对话框的显示与隐藏
           addDialogVisible:false,
            AddForm:{
            attr_name:''
            },

            AddFormRules:{
           attr_name: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
            ]
            },
            //控制按钮与文本框的切换形式
            inputVisible:false,
            //文本框中输入的内容
            inputValue:''
        }
       
    },
    created(){
        //获取所有商品分类函数
        this.getCateList()
    },
    methods:{
        async getCateList(){
            const{data:res}=await this.$http.get('categories')
            console.log(res)
            if(res.meta.status!==200){
                this.$message.error("获取商品分类信息失败")
            }
            this.cateList=res.data
        },
        selectCateChange(){
            this.getParamsData()
        },
        //tab页签点击事件的处理
        handleTabClick(){
            this.getParamsData()
        },
       async getParamsData(){
           
            //判断选择的是否是三级分类
           if(this.selectKeys.length!==3){
                this.selectKeys=[]
                this.manyTableData=[]
                this.onlyTableData=[]
                return
            }
            //如果是三级分类
            const {data:res}= await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
            if(res.meta.status!==200){
                this.$message.error('获取参数列表失败')
            }
            res.data.forEach(item => {
                item.attr_vals=item.attr_vals?item.attr_vals.split(' '):[]
                //控制文本框的显示与隐藏
                item.inputVisible=false
                //文本框中输入的值
                item.inputValue=''
            })
            console.log(res.data)
            if(this.activeName=='many'){
                this.manyTableData=res.data
            }else{
                this.onlyTableData=res.data
            }
        },

        addDialogVisibleClosed(){
            this.$refs.AddFormRef.resetFields()
        },
        async addParams(){
            const {data:res}= await this.$http.post(`categories/${this.cateId}/attributes`,
            {attr_name:this.AddForm.attr_name,attr_sel:this.activeName})
            if(res.meta.status!==201){
                return this.$message.error("添加参数属性失败")
            }
            this.$message.success("添加参数成功")
            this.addDialogVisible = false
            this.getParamsData()
        },
        //文本框失去焦点或者enter建都会触发
        handleInputConfirm(row){
            if(row.inputValue.trim().length===0){
                row.inputValue=''
                row.inputVisible=false
                return
            }
            //如果没有return，需要做后期的处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue=''
            row.inputVisible=false
            console.log('ok')
        },
        showInput(row){
            row.inputVisible=true
            //让文本框自动获取交点
             this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        })
        }
    },
    computed:{
        //如果按钮需要被禁用，则返回true,反之返回false
        isBtnDisabled(){
            if(this.selectKeys.length!==3){
                return true
            }
            return false
        },
        //当前选中的三级分类的Id
        cateId(){
            if(this.selectKeys.length===3){
                return this.selectKeys[2]
            }
            return null
        },
        //动态计算标题的文本
        titleText(){
            if(this.activeName==='many'){
                return '动态参数'
            }
            return '静态属性'
        }
    }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
  .el-cascader {
    width: 50%;
  }
}
.input-new-tag {
  width: 120px;
}
</style>