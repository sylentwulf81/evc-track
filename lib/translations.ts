export type Language = "en" | "es" | "ja"

export type TranslationKeys = {
    common: {
        dashboard: string
        settings: string
        signOut: string
        save: string
        cancel: string
        edit: string
        delete: string
        back: string
        loading: string
        language: string
        currency: string
        active: string
        date: string
        cost: string
        error: string
        success: string
        optional: string
        close: string
        saving: string
        saveChanges: string
        deleting: string
        records: string
        sessions: string
        theme: string
    }
    nav: {
        charging: string
        expenses: string
        analytics: string
    }
    tracker: {
        currentStatus: string
        notCharging: string
        startCharging: string
        stopCharging: string
        sessionActive: string
        startedAt: string
        elapsed: string
        addManual: string
        addExpense: string
        noSessions: string
        addCharge: string
        enterDetails: string
        homeCharge: string
        autoCalc: string
        chargeType: string
        fast: string
        standard: string
        addSession: string
        expenseAdded: string
        sessionAdded: string
        enterExpenseDetails: string
        sessionDetails: string
        editSession: string
        updateSessionDetails: string
        fastFast: string
        standardStandard: string
        deleteConfirm: string
        deleteWarning: string
        totalGained: string
        level1: string
        level2: string
        chademo: string
        ccs: string
        tesla: string
        type2: string
    }
    history: {
        total: string
        monthlyHistory: string
        chargingHistory: string
        expenseHistory: string
        noData: string
    }
    settings: {
        title: string
        vehicleProfile: string
        vehicleProfileDesc: string
        batteryCapacity: string
        batteryCapacityDesc: string
        homeRate: string
        homeRateDesc: string
        dataManagement: string
        exportData: string
        guestMode: string
        signInToSync: string
        version: string
        selectEv: string
        searchEv: string
        selectVehicle: string
        noVehicleFound: string
        themeDesc: string
    }
    forms: {
        date: string
        time: string
        kwhAdded: string
        startPercent: string
        endPercent: string
        cost: string
        location: string
        notes: string
        type: string
        fast: string
        standard: string
        category: string
        amount: string
        title: string
        odometer: string
        vehicleBattery: string
        homeRate: string
        titlePlaceholder: string
        notesPlaceholder: string
        energy: string
        dateTime: string
        chargingProgress: string
        maintenance: string
        repair: string
        insurance: string
        tax: string
        other: string
    }
    expenseCategories: {
        maintenance: string
        repair: string
        insurance: string
        tax: string
        other: string
    }
    analytics: {
        noData: string
        monthlySpending: string
        combinedCosts: string
        chargingCosts: string
        byChargeType: string
        vehicleExpenses: string
        byCategory: string
        noExpenseData: string
        grandTotal: string
        chargingPlusExpenses: string
        chargingTotal: string
        expensesTotal: string
    }
}

export const translations: Record<Language, TranslationKeys> = {
    en: {
        common: {
            dashboard: "Dashboard",
            settings: "Settings",
            signOut: "Sign Out",
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            back: "Back",
            loading: "Loading...",
            language: "Language",
            currency: "Currency",
            active: "Active",
            date: "Date",
            cost: "Cost",
            error: "Error",
            success: "Success",
            optional: "Optional",
            close: "Close",
            saving: "Saving...",
            saveChanges: "Save Changes",
            deleting: "Deleting...",
            records: "records",
            sessions: "sessions",
            theme: "Appearance",
        },
        nav: {
            charging: "Charging",
            expenses: "Expenses",
            analytics: "Analytics",
        },
        tracker: {
            currentStatus: "Current Status",
            notCharging: "Not Charging",
            startCharging: "Start Charging",
            stopCharging: "Stop Charging",
            sessionActive: "Session Active",
            startedAt: "Started at",
            elapsed: "Elapsed",
            addManual: "Add Charge",
            addExpense: "Add Expense",
            noSessions: "No sessions yet",
            addCharge: "Add Session",
            enterDetails: "Enter the details of your charging session.",
            homeCharge: "Home Charge",
            autoCalc: "Auto-calc cost",
            chargeType: "Charge Type",
            fast: "Fast",
            standard: "Standard",
            addSession: "Add Session",
            expenseAdded: "Expense added successfully",
            sessionAdded: "Charging session added",
            enterExpenseDetails: "Log a maintenance, repair, or other vehicle cost",
            sessionDetails: "Session Details",
            editSession: "Edit Session",
            updateSessionDetails: "Update the details of this charging session",
            fastFast: "Fast Charge",
            standardStandard: "Standard Charge",
            deleteConfirm: "Delete charging session?",
            deleteWarning: "This action cannot be undone. This will permanently delete this charging session.",
            totalGained: "Total Gained",
            level1: "Level 1 (120V)",
            level2: "Level 2 (240V)",
            chademo: "CHAdeMO",
            ccs: "CCS",
            tesla: "Tesla Supercharger",
            type2: "Type 2",
        },
        history: {
            total: "Total",
            monthlyHistory: "Monthly History",
            chargingHistory: "Charging History",
            expenseHistory: "Expense History",
            noData: "No data available",
        },
        settings: {
            title: "Settings",
            vehicleProfile: "Vehicle Profile",
            vehicleProfileDesc: "Set your car's details for smart calculations",
            batteryCapacity: "Battery Capacity",
            batteryCapacityDesc: "Used to calculate energy added from % change",
            homeRate: "Home Electricity Rate",
            homeRateDesc: "Used to auto-calculate cost for home charging",
            selectEv: "Select Popular EV",
            searchEv: "Search vehicle...",
            selectVehicle: "Select vehicle",
            noVehicleFound: "No vehicle found.",
            dataManagement: "Data Management",
            exportData: "Export to CSV",
            guestMode: "Guest Mode",
            signInToSync: "Sign in to sync these settings across your devices.",
            version: "App Version",
            themeDesc: "Select your preferred theme",
        },
        forms: {
            date: "Date",
            time: "Time",
            kwhAdded: "kWh Added",
            startPercent: "Start %",
            endPercent: "End %",
            cost: "Cost",
            location: "Location",
            notes: "Notes",
            type: "Type",
            fast: "Fast",
            standard: "Standard",
            category: "Category",
            amount: "Amount",
            title: "Title",
            odometer: "Odometer",
            vehicleBattery: "Vehicle Battery",
            homeRate: "Home Rate",
            titlePlaceholder: "e.g. Oil Change, New Tires",
            notesPlaceholder: "Additional details...",
            energy: "Energy",
            dateTime: "Date & Time",
            chargingProgress: "Charging Progress",
            maintenance: "Maintenance",
            repair: "Repair",
            insurance: "Insurance",
            tax: "Tax",
            other: "Other",
        },
        expenseCategories: {
            maintenance: "Maintenance",
            repair: "Repair",
            insurance: "Insurance",
            tax: "Tax",
            other: "Other",
        },
        analytics: {
            noData: "No data available for analytics. Start adding charging sessions or expenses!",
            monthlySpending: "Total Monthly Spending",
            combinedCosts: "Combined charging and maintenance costs (nominal)",
            chargingCosts: "Charging Costs",
            byChargeType: "By Charge Type",
            vehicleExpenses: "Vehicle Expenses",
            byCategory: "By Category",
            noExpenseData: "No expense data",
            grandTotal: "Grand Total Spent",
            chargingPlusExpenses: "Charging + Expenses",
            chargingTotal: "Charging Total",
            expensesTotal: "Expenses Total",
        }
    },
    es: {
        common: {
            dashboard: "Panel",
            settings: "Ajustes",
            signOut: "Cerrar Sesión",
            save: "Guardar",
            cancel: "Cancelar",
            edit: "Editar",
            delete: "Eliminar",
            back: "Atrás",
            loading: "Cargando...",
            language: "Idioma",
            currency: "Moneda",
            active: "Activo",
            date: "Fecha",
            cost: "Costo",
            error: "Error",
            success: "Éxito",
            optional: "Opcional",
            close: "Cerrar",
            saving: "Guardando...",
            saveChanges: "Guardar Cambios",
            deleting: "Eliminando...",
            records: "registros",
            sessions: "sesiones",
            theme: "Apariencia",
        },
        nav: {
            charging: "Carga",
            expenses: "Gastos",
            analytics: "Analítica",
        },
        tracker: {
            currentStatus: "Estado Actual",
            notCharging: "No Cargando",
            startCharging: "Iniciar Carga",
            stopCharging: "Detener Carga",
            sessionActive: "Sesión Activa",
            startedAt: "Iniciado a las",
            elapsed: "Transcurrido",
            addManual: "Añadir Carga",
            addExpense: "Añadir Gasto",
            noSessions: "Sin sesiones aún",
            addCharge: "Añadir Sesión",
            enterDetails: "Introduce los detalles de tu sesión de carga.",
            homeCharge: "Carga en Casa",
            autoCalc: "Auto-calc costo",
            chargeType: "Tipo de Carga",
            fast: "Rápida",
            standard: "Estándar",
            addSession: "Añadir Sesión",
            expenseAdded: "Gasto añadido con éxito",
            sessionAdded: "Sesión de carga añadida",
            enterExpenseDetails: "Registra un mantenimiento, reparación u otro costo",
            sessionDetails: "Detalles de la Sesión",
            editSession: "Editar Sesión",
            updateSessionDetails: "Actualizar los detalles de esta sesión",
            fastFast: "Carga Rápida",
            standardStandard: "Carga Estándar",
            deleteConfirm: "¿Eliminar sesión de carga?",
            deleteWarning: "Esta acción no se puede deshacer. Eliminará permanentemente esta sesión.",
            totalGained: "Total Ganado",
            level1: "Nivel 1 (120V)",
            level2: "Nivel 2 (240V)",
            chademo: "CHAdeMO",
            ccs: "CCS",
            tesla: "Supercargador Tesla",
            type2: "Tipo 2",
        },
        history: {
            total: "Total",
            monthlyHistory: "Historial Mensual",
            chargingHistory: "Historial de Carga",
            expenseHistory: "Historial de Gastos",
            noData: "No hay datos disponibles",
        },
        settings: {
            title: "Ajustes",
            vehicleProfile: "Perfil del Vehículo",
            vehicleProfileDesc: "Configura detalles para cálculos inteligentes",
            batteryCapacity: "Capacidad de Batería",
            batteryCapacityDesc: "Usado para calcular energía añadida desde %",
            homeRate: "Tarifa Eléctrica Hogar",
            homeRateDesc: "Usado para auto-calcular costo de carga en casa",
            selectEv: "Seleccionar EV Popular",
            searchEv: "Buscar vehículo...",
            selectVehicle: "Seleccionar vehículo",
            noVehicleFound: "No se encontró vehículo.",
            dataManagement: "Gestión de Datos",
            exportData: "Exportar a CSV",
            guestMode: "Modo Invitado",
            signInToSync: "Inicia sesión para sincronizar estos ajustes.",
            version: "Versión de la App",
            themeDesc: "Selecciona tu tema preferido",
        },
        forms: {
            date: "Fecha",
            time: "Hora",
            kwhAdded: "kWh Añadidos",
            startPercent: "% Inicio",
            endPercent: "% Fin",
            cost: "Costo",
            location: "Ubicación",
            notes: "Notas",
            type: "Tipo",
            fast: "Rápida",
            standard: "Estándar",
            category: "Categoría",
            amount: "Monto",
            title: "Título",
            odometer: "Odómetro",
            vehicleBattery: "Batería Vehículo",
            homeRate: "Tarifa Hogar",
            titlePlaceholder: "ej. Cambio de Aceite",
            notesPlaceholder: "Detalles adicionales...",
            energy: "Energía",
            dateTime: "Fecha y Hora",
            chargingProgress: "Progreso Carga",
            maintenance: "Mantenimiento",
            repair: "Reparación",
            insurance: "Seguro",
            tax: "Impuesto",
            other: "Otro",
        },
        expenseCategories: {
            maintenance: "Mantenimiento",
            repair: "Reparación",
            insurance: "Seguro",
            tax: "Impuesto",
            other: "Otro",
        },
        analytics: {
            noData: "No hay datos disponibles. ¡Comienza a añadir sesiones o gastos!",
            monthlySpending: "Gasto Mensual Total",
            combinedCosts: "Costos combinados de carga y mantenimiento",
            chargingCosts: "Costos de Carga",
            byChargeType: "Por Tipo de Carga",
            vehicleExpenses: "Gastos del Vehículo",
            byCategory: "Por Categoría",
            noExpenseData: "Sin datos de gastos",
            grandTotal: "Gran Total Gastado",
            chargingPlusExpenses: "Carga + Gastos",
            chargingTotal: "Total Carga",
            expensesTotal: "Total Gastos",
        }
    },
    ja: {
        common: {
            dashboard: "ダッシュボード",
            settings: "設定",
            signOut: "ログアウト",
            save: "保存",
            cancel: "キャンセル",
            edit: "編集",
            delete: "削除",
            back: "戻る",
            loading: "読み込み中...",
            language: "言語",
            currency: "通貨",
            active: "アクティブ",
            date: "日付",
            cost: "費用",
            error: "エラー",
            success: "成功",
            optional: "任意",
            close: "閉じる",
            saving: "保存中...",
            saveChanges: "変更を保存",
            deleting: "削除中...",
            records: "件",
            sessions: "回",
            theme: "外観",
        },
        nav: {
            charging: "充電",
            expenses: "経費",
            analytics: "分析",
        },
        tracker: {
            currentStatus: "現在の状態",
            notCharging: "充電していません",
            startCharging: "充電開始",
            stopCharging: "充電停止",
            sessionActive: "セッション中",
            startedAt: "開始時刻",
            elapsed: "経過時間",
            addManual: "充電記録を追加",
            addExpense: "経費を追加",
            noSessions: "セッションはまだありません",
            addCharge: "セッションを追加",
            enterDetails: "充電セッションの詳細を入力してください。",
            homeCharge: "自宅充電",
            autoCalc: "自動計算",
            chargeType: "充電タイプ",
            fast: "急速",
            standard: "普通",
            addSession: "セッションを追加",
            expenseAdded: "経費を追加しました",
            sessionAdded: "充電セッションを追加しました",
            enterExpenseDetails: "メンテナンス、修理、その他の費用を記録",
            sessionDetails: "セッション詳細",
            editSession: "セッション編集",
            updateSessionDetails: "このセッションの詳細を更新",
            fastFast: "急速充電",
            standardStandard: "普通充電",
            deleteConfirm: "セッションを削除しますか？",
            deleteWarning: "この操作は取り消せません。この充電セッションは完全に削除されます。",
            totalGained: "充電量",
            level1: "レベル1 (100V)",
            level2: "レベル2 (200V)",
            chademo: "CHAdeMO",
            ccs: "CCS",
            tesla: "テスラ スーパーチャージャー",
            type2: "Type 2",
        },
        history: {
            total: "合計",
            monthlyHistory: "月次履歴",
            chargingHistory: "充電履歴",
            expenseHistory: "経費履歴",
            noData: "データがありません",
        },
        settings: {
            title: "設定",
            vehicleProfile: "車両プロファイル",
            vehicleProfileDesc: "計算のために車両の詳細を設定します",
            batteryCapacity: "バッテリー容量",
            batteryCapacityDesc: "％変化から充電量を計算するために使用",
            homeRate: "自宅電気料金",
            homeRateDesc: "自宅充電のコストを自動計算するために使用",
            selectEv: "人気のEVを選択",
            searchEv: "車両を検索...",
            selectVehicle: "車両を選択",
            noVehicleFound: "車両が見つかりません。",
            dataManagement: "データ管理",
            exportData: "CSVエクスポート",
            guestMode: "ゲストモード",
            signInToSync: "設定を同期するにはログインしてください。",
            version: "アプリバージョン",
            themeDesc: "テーマを選択してください",
        },
        forms: {
            date: "日付",
            time: "時間",
            kwhAdded: "充電量 (kWh)",
            startPercent: "開始 %",
            endPercent: "終了 %",
            cost: "費用",
            location: "場所",
            notes: "メモ",
            type: "タイプ",
            fast: "急速",
            standard: "普通",
            category: "カテゴリー",
            amount: "金額",
            title: "タイトル",
            odometer: "オドメーター",
            vehicleBattery: "バッテリー容量",
            homeRate: "自宅単価",
            titlePlaceholder: "例: オイル交換、タイヤ交換",
            notesPlaceholder: "詳細...",
            energy: "エネルギー",
            dateTime: "日時",
            chargingProgress: "充電状況",
            maintenance: "メンテナンス",
            repair: "修理",
            insurance: "保険",
            tax: "税金",
            other: "その他",
        },
        expenseCategories: {
            maintenance: "メンテナンス",
            repair: "修理",
            insurance: "保険",
            tax: "税金",
            other: "その他",
        },
        analytics: {
            noData: "データがありません。充電や経費を追加してください！",
            monthlySpending: "月間総支出",
            combinedCosts: "充電とメンテナンスの合計コスト",
            chargingCosts: "充電コスト",
            byChargeType: "充電タイプ別",
            vehicleExpenses: "車両経費",
            byCategory: "カテゴリー別",
            noExpenseData: "経費データなし",
            grandTotal: "総支出",
            chargingPlusExpenses: "充電 + 経費",
            chargingTotal: "充電合計",
            expensesTotal: "経費合計",
        }
    },
}
