# 设计

这个文档算是我的小黄鸭吧

## 角色卡存储

- 注入 User 感觉会增加负重
  - 并且不确定 ORM 好不好存
  - 也考虑存 serialized json
- 如果单独开表就无法用 userFields 拿到数据，要额外调数据库

## 规则管理

不同版本规则以及房规，针对不同上下文启用和切换
影响范围暂时考虑到角色卡和检定

## 检定处理

- 给定的技能或目标数值
- 加减值
- 困难极难 ( coc

## 状态管理

### 跑团

1. 维护人员列表
2. Log 记录和上色

### 数值

- 自动计算人物卡补正
  - 临时加值
  - 同名加值
- 战斗时 KP 手动宣言补正
- KP 手动宣言过回合
- 增加双方操作感和代入感