/* 
 * 回滚工具 - 用于快速恢复到上一个稳定版本
 * 使用方法：在浏览器控制台运行 localStorage.setItem('rollbacks', 'v1.7.8')
 */
(function() {
  'use strict';
  
  // 版本控制
  window.VERSION_CONTROL = {
    current: 'v1.8.1',
    lastStable: 'v1.7.8',
    
    // 检查是否需要回滚
    checkRollback: function() {
      var forced = localStorage.getItem('rollbacks');
      if (forced && forced !== this.current) {
        console.warn('[Version Control] 检测到强制回滚指令:', forced);
        return forced;
      }
      return null;
    },
    
    // 执行回滚
    rollback: function(targetVersion) {
      localStorage.setItem('rollbacks', targetVersion);
      console.log('[Version Control] 已设置回滚到:', targetVersion);
      location.reload();
    },
    
    // 清除回滚设置
    clearRollback: function() {
      localStorage.removeItem('rollbacks');
      console.log('[Version Control] 已清除回滚设置');
      location.reload();
    }
  };
  
  // 初始化时检查
  var target = window.VERSION_CONTROL.checkRollback();
  if (target) {
    console.warn('[Version Control] 回滚到', target, '...');
    // 实际回滚逻辑在这里实现
  }
})();
