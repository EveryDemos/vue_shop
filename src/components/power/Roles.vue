<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表区-->
      <el-table :data="rolesList" border stripe>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scop">
            <el-row
              :class="['bdbottom',i1===0 ?'bdtop':'','vcenter']"
              v-for="(item1,i1) in scop.row.children"
              :key="item1.id"
            >
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scop.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二三级权限-->
              <el-col :span="19">
                <!--通过for循环嵌套渲染二级权限-->
                <el-row
                  :class="[i2===0 ?'':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scop.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scop.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scop">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scop.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--展示分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="rightDialogVisible"
      width="50%"
      @close="setRightDialogClosed()"
    >
      <!--树形控件-->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //角色列表数据
      rolesList: [],
      //是否展示分配权限对话框
      rightDialogVisible: false,
      //角色列表数据
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //默认选中的id节点数组
      defKeys: [],
      //当前即将分配权限的角色id
      roleId:''
    }
  },
  created() {
    //获取角色列表
    this.getRolesList()
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    //删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info("已取消删除操作")
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除该权限失败')
      }
      this.$message.success('删除该权限成功')
      //this.getRolesList()
      role.children = res.data
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
        this.roleId=role.id
      //获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      //console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限树形列表失败！')
      }
      this.rightsList = res.data

      this.getLeafKeys(role, this.defKeys)
      this.rightDialogVisible = true
    },
    //通过递归的形式获取角色下所有三级权限的id并绑定到defKeys中
    getLeafKeys(node, arr) {
      //如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(element => {
        this.getLeafKeys(element, arr)
      });
    },
    //监听分配权限对话框的关闭事件，关闭后清空arr权限id数组
    setRightDialogClosed() {
      this.defKeys = []
    },
    //点击为角色分配权限  ...是展开运算符
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(),
      ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const idStr=keys.join(',')
     const {data:res}= await this.$http.post(`/roles/${this.roleId}/rights`,{rids:idStr})
     if(res.meta.status!==200){
         this.$message.error("分配权限失败")
     }
     this.$message.success("分配权限成功")
     this.getRolesList()
     this.rightDialogVisible=false
    }

  }



}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}

//纵向居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>